from datetime import date
from typing import Optional
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.complaint import Complaint, ComplaintStatus
from app.models.company import CompanyProfile, SubscriptionTier
from app.models.job import Job, JobApplication, JobStatus, ApplicationStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def _date_filter(self, query, model, start_date: Optional[date], end_date: Optional[date]):
        if start_date:
            query = query.filter(func.date(model.created_at) >= start_date)
        if end_date:
            query = query.filter(func.date(model.created_at) <= end_date)
        return query

    # Report 1: User Registration Summary by Role
    def user_registration_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = self.db.query(
            User.role.label("role"),
            func.count(User.id).label("total"),
            func.sum(case((User.is_verified == True, 1), else_=0)).label("verified"),
            func.sum(case((User.is_active == True, 1), else_=0)).label("active"),
            func.sum(case((User.is_active == False, 1), else_=0)).label("inactive"),
        ).group_by(User.role)
        query = self._date_filter(query, User, start_date, end_date)
        rows = query.all()
        return [
            {
                "role": r.role,
                "total": r.total,
                "verified": r.verified or 0,
                "active": r.active or 0,
                "inactive": r.inactive or 0,
            }
            for r in rows
        ]

    # Report 2: Job Status Summary
    def job_status_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = self.db.query(
            Job.status.label("status"),
            func.count(Job.id).label("count"),
            func.coalesce(func.avg(Job.daily_wage), 0.0).label("avg_daily_wage"),
            func.coalesce(func.sum(Job.total_budget), 0.0).label("total_budget"),
        ).group_by(Job.status)
        query = self._date_filter(query, Job, start_date, end_date)
        rows = query.all()
        return [
            {
                "status": r.status,
                "count": r.count,
                "avg_daily_wage": round(float(r.avg_daily_wage), 2),
                "total_budget": round(float(r.total_budget), 2),
            }
            for r in rows
        ]

    # Report 3: Jobs by Category
    def job_category_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = self.db.query(
            Job.category.label("category"),
            func.count(Job.id).label("total_jobs"),
            func.sum(case((Job.status == JobStatus.OPEN, 1), else_=0)).label("open_jobs"),
            func.sum(case((Job.status == JobStatus.COMPLETED, 1), else_=0)).label("completed_jobs"),
            func.coalesce(func.avg(Job.daily_wage), 0.0).label("avg_wage"),
        ).group_by(Job.category).order_by(func.count(Job.id).desc())
        query = self._date_filter(query, Job, start_date, end_date)
        rows = query.all()
        return [
            {
                "category": r.category,
                "total_jobs": r.total_jobs,
                "open_jobs": r.open_jobs or 0,
                "completed_jobs": r.completed_jobs or 0,
                "avg_wage": round(float(r.avg_wage), 2),
            }
            for r in rows
        ]

    # Report 4: Worker Skills Distribution
    def worker_skills_report(self) -> list[dict]:
        rows = (
            self.db.query(
                WorkerProfile.primary_skill.label("primary_skill"),
                func.count(WorkerProfile.id).label("worker_count"),
                func.coalesce(func.avg(WorkerProfile.rating_avg), 0.0).label("avg_rating"),
                func.coalesce(func.avg(WorkerProfile.daily_rate), 0.0).label("avg_daily_rate"),
                func.sum(
                    case((WorkerProfile.is_aadhaar_verified == True, 1), else_=0)
                ).label("verified_count"),
            )
            .filter(WorkerProfile.primary_skill.isnot(None))
            .group_by(WorkerProfile.primary_skill)
            .order_by(func.count(WorkerProfile.id).desc())
            .all()
        )
        return [
            {
                "primary_skill": r.primary_skill,
                "worker_count": r.worker_count,
                "avg_rating": round(float(r.avg_rating), 2),
                "avg_daily_rate": round(float(r.avg_daily_rate), 2),
                "verified_count": r.verified_count or 0,
            }
            for r in rows
        ]

    # Report 5: City-wise Activity
    def city_activity_report(self) -> list[dict]:
        job_city = (
            self.db.query(Job.city.label("city"), func.count(Job.id).label("jobs"))
            .group_by(Job.city)
            .subquery()
        )
        worker_city = (
            self.db.query(
                WorkerProfile.city.label("city"),
                func.count(WorkerProfile.id).label("workers"),
            )
            .filter(WorkerProfile.city.isnot(None))
            .group_by(WorkerProfile.city)
            .subquery()
        )
        company_city = (
            self.db.query(
                CompanyProfile.city.label("city"),
                func.count(CompanyProfile.id).label("companies"),
            )
            .filter(CompanyProfile.city.isnot(None))
            .group_by(CompanyProfile.city)
            .subquery()
        )

        all_cities = (
            self.db.query(Job.city.label("city"))
            .union(
                self.db.query(WorkerProfile.city).filter(WorkerProfile.city.isnot(None)),
                self.db.query(CompanyProfile.city).filter(CompanyProfile.city.isnot(None)),
            )
            .distinct()
            .subquery()
        )

        rows = (
            self.db.query(
                all_cities.c.city,
                func.coalesce(job_city.c.jobs, 0).label("total_jobs"),
                func.coalesce(worker_city.c.workers, 0).label("total_workers"),
                func.coalesce(company_city.c.companies, 0).label("total_companies"),
            )
            .outerjoin(job_city, all_cities.c.city == job_city.c.city)
            .outerjoin(worker_city, all_cities.c.city == worker_city.c.city)
            .outerjoin(company_city, all_cities.c.city == company_city.c.city)
            .order_by(func.coalesce(job_city.c.jobs, 0).desc())
            .limit(20)
            .all()
        )
        return [
            {
                "city": r.city,
                "total_jobs": r.total_jobs,
                "total_workers": r.total_workers,
                "total_companies": r.total_companies,
            }
            for r in rows
        ]

    # Report 6: Application Status Distribution
    def application_stats_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = self.db.query(
            JobApplication.status.label("status"),
            func.count(JobApplication.id).label("count"),
        ).group_by(JobApplication.status)
        query = self._date_filter(query, JobApplication, start_date, end_date)
        rows = query.all()
        total = sum(r.count for r in rows) or 1
        return [
            {
                "status": r.status,
                "count": r.count,
                "percentage": round(r.count / total * 100, 2),
            }
            for r in rows
        ]

    # Report 7: Complaint Summary
    def complaint_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = self.db.query(
            Complaint.status.label("status"),
            func.count(Complaint.id).label("count"),
        ).group_by(Complaint.status)
        query = self._date_filter(query, Complaint, start_date, end_date)
        rows = query.all()
        return [{"status": r.status, "count": r.count} for r in rows]

    # Report 8: Top Workers by Rating & Jobs Completed
    def top_workers_report(self, limit: int = 20) -> list[dict]:
        rows = (
            self.db.query(
                WorkerProfile.id.label("worker_id"),
                User.full_name.label("full_name"),
                WorkerProfile.primary_skill.label("primary_skill"),
                WorkerProfile.city.label("city"),
                WorkerProfile.rating_avg.label("rating_avg"),
                WorkerProfile.total_jobs_completed.label("total_jobs_completed"),
                WorkerProfile.daily_rate.label("daily_rate"),
            )
            .join(User, User.id == WorkerProfile.user_id)
            .filter(User.is_active == True)
            .order_by(
                WorkerProfile.rating_avg.desc(),
                WorkerProfile.total_jobs_completed.desc(),
            )
            .limit(limit)
            .all()
        )
        return [
            {
                "worker_id": r.worker_id,
                "full_name": r.full_name,
                "primary_skill": r.primary_skill or "N/A",
                "city": r.city or "N/A",
                "rating_avg": round(float(r.rating_avg), 2),
                "total_jobs_completed": r.total_jobs_completed,
                "daily_rate": round(float(r.daily_rate), 2) if r.daily_rate else None,
            }
            for r in rows
        ]