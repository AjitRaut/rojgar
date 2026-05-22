from datetime import date
from typing import Optional
from sqlalchemy import func, case
from sqlalchemy.orm import Session

from app.models.complaint import Complaint, ComplaintStatus
from app.models.company import CompanyProfile
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

    # Report 1: User Registration Report (row-level)
    def user_registration_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = self.db.query(
            User.id,
            User.full_name,
            User.email,
            User.phone,
            User.role,
            User.is_verified,
            User.is_active,
            User.created_at,
        ).order_by(User.created_at.desc())
        query = self._date_filter(query, User, start_date, end_date)
        rows = query.all()
        return [
            {
                "id": r.id,
                "full_name": r.full_name,
                "email": r.email,
                "phone": r.phone or "N/A",
                "role": r.role,
                "is_verified": "Yes" if r.is_verified else "No",
                "is_active": "Yes" if r.is_active else "No",
                "registered_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 2: Job Listings Report (row-level)
    def job_listings_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = (
            self.db.query(
                Job.id,
                Job.title,
                Job.category,
                Job.city,
                Job.state,
                Job.daily_wage,
                Job.workers_needed,
                Job.duration_days,
                Job.status,
                Job.is_urgent,
                Job.created_at,
                User.full_name.label("posted_by"),
            )
            .join(User, User.id == Job.posted_by_id)
            .order_by(Job.created_at.desc())
        )
        query = self._date_filter(query, Job, start_date, end_date)
        rows = query.all()
        return [
            {
                "id": r.id,
                "title": r.title,
                "posted_by": r.posted_by,
                "category": r.category,
                "city": r.city,
                "state": r.state or "N/A",
                "daily_wage": round(float(r.daily_wage), 2),
                "workers_needed": r.workers_needed,
                "duration_days": r.duration_days,
                "status": r.status.replace("_", " ").capitalize() if isinstance(r.status, str) else str(r.status).replace("_", " ").capitalize(),
                "is_urgent": "Yes" if r.is_urgent else "No",
                "posted_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 3: Job Applications Report (row-level)
    def job_applications_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        worker_alias = User.__table__.alias("worker_user")
        query = (
            self.db.query(
                JobApplication.id,
                User.full_name.label("worker_name"),
                User.email.label("worker_email"),
                Job.title.label("job_title"),
                Job.city.label("job_city"),
                JobApplication.status,
                JobApplication.proposed_rate,
                JobApplication.created_at,
            )
            .join(Job, Job.id == JobApplication.job_id)
            .join(User, User.id == JobApplication.worker_id)
            .order_by(JobApplication.created_at.desc())
        )
        query = self._date_filter(query, JobApplication, start_date, end_date)
        rows = query.all()
        return [
            {
                "id": r.id,
                "worker_name": r.worker_name,
                "worker_email": r.worker_email,
                "job_title": r.job_title,
                "job_city": r.job_city,
                "status": str(r.status).replace("_", " ").capitalize(),
                "proposed_rate": f"₹{round(float(r.proposed_rate), 2):,.2f}" if r.proposed_rate else "N/A",
                "applied_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 4: Worker Profiles Report (row-level)
    def worker_profiles_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        query = (
            self.db.query(
                User.full_name,
                User.email,
                WorkerProfile.primary_skill,
                WorkerProfile.city,
                WorkerProfile.state,
                WorkerProfile.daily_rate,
                WorkerProfile.experience_years,
                WorkerProfile.rating_avg,
                WorkerProfile.total_jobs_completed,
                WorkerProfile.is_available,
                WorkerProfile.is_aadhaar_verified,
                User.created_at,
            )
            .join(User, User.id == WorkerProfile.user_id)
            .filter(User.is_active == True)
            .order_by(WorkerProfile.rating_avg.desc())
        )
        query = self._date_filter(query, User, start_date, end_date)
        rows = query.all()
        return [
            {
                "full_name": r.full_name,
                "email": r.email,
                "primary_skill": r.primary_skill or "N/A",
                "city": r.city or "N/A",
                "state": r.state or "N/A",
                "daily_rate": f"₹{round(float(r.daily_rate), 0):,.0f}" if r.daily_rate else "N/A",
                "experience_years": r.experience_years,
                "rating_avg": round(float(r.rating_avg), 1),
                "total_jobs_completed": r.total_jobs_completed,
                "is_available": "Yes" if r.is_available else "No",
                "aadhaar_verified": "Yes" if r.is_aadhaar_verified else "No",
                "joined_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 5: Company Profiles Report (row-level)
    def company_profiles_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        job_count_sub = (
            self.db.query(
                Job.posted_by_id,
                func.count(Job.id).label("total_jobs"),
            )
            .group_by(Job.posted_by_id)
            .subquery()
        )
        query = (
            self.db.query(
                CompanyProfile.company_name,
                CompanyProfile.company_type,
                CompanyProfile.city,
                CompanyProfile.state,
                CompanyProfile.subscription_tier,
                CompanyProfile.is_gst_verified,
                User.email,
                User.created_at,
                func.coalesce(job_count_sub.c.total_jobs, 0).label("total_jobs"),
            )
            .join(User, User.id == CompanyProfile.user_id)
            .outerjoin(job_count_sub, job_count_sub.c.posted_by_id == User.id)
            .order_by(func.coalesce(job_count_sub.c.total_jobs, 0).desc())
        )
        query = self._date_filter(query, User, start_date, end_date)
        rows = query.all()
        return [
            {
                "company_name": r.company_name,
                "company_type": r.company_type or "N/A",
                "email": r.email,
                "city": r.city or "N/A",
                "state": r.state or "N/A",
                "subscription_tier": str(r.subscription_tier).capitalize(),
                "gst_verified": "Yes" if r.is_gst_verified else "No",
                "total_jobs_posted": r.total_jobs,
                "registered_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 6: Complaint Report (row-level)
    def complaint_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        raised_by = User.__table__.alias("raised_by")
        against = User.__table__.alias("against_user")

        query = (
            self.db.query(
                Complaint.id,
                Complaint.subject,
                Complaint.status,
                Complaint.created_at,
                raised_by.c.full_name.label("raised_by_name"),
                raised_by.c.email.label("raised_by_email"),
                against.c.full_name.label("against_name"),
                Job.title.label("job_title"),
            )
            .join(raised_by, raised_by.c.id == Complaint.raised_by_id)
            .outerjoin(against, against.c.id == Complaint.against_id)
            .outerjoin(Job, Job.id == Complaint.job_id)
            .order_by(Complaint.created_at.desc())
        )
        query = self._date_filter(query, Complaint, start_date, end_date)
        rows = query.all()
        return [
            {
                "id": r.id,
                "subject": r.subject,
                "raised_by": r.raised_by_name,
                "raised_by_email": r.raised_by_email,
                "against": r.against_name or "N/A",
                "related_job": r.job_title or "N/A",
                "status": str(r.status).replace("_", " ").capitalize(),
                "filed_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 7: Reviews & Ratings Report (row-level)
    def reviews_report(
        self, start_date: Optional[date] = None, end_date: Optional[date] = None
    ) -> list[dict]:
        reviewer = User.__table__.alias("reviewer")
        reviewee = User.__table__.alias("reviewee")

        query = (
            self.db.query(
                Review.id,
                Review.rating,
                Review.comment,
                Review.review_type,
                Review.created_at,
                reviewer.c.full_name.label("reviewer_name"),
                reviewee.c.full_name.label("reviewee_name"),
                Job.title.label("job_title"),
            )
            .join(reviewer, reviewer.c.id == Review.reviewer_id)
            .join(reviewee, reviewee.c.id == Review.reviewee_id)
            .join(Job, Job.id == Review.job_id)
            .order_by(Review.created_at.desc())
        )
        query = self._date_filter(query, Review, start_date, end_date)
        rows = query.all()
        return [
            {
                "id": r.id,
                "reviewer": r.reviewer_name,
                "reviewee": r.reviewee_name,
                "job_title": r.job_title,
                "rating": r.rating,
                "comment": r.comment or "No comment",
                "review_type": str(r.review_type).replace("_", " ").capitalize(),
                "reviewed_on": r.created_at.strftime("%d %b %Y") if r.created_at else "N/A",
            }
            for r in rows
        ]

    # Report 8: City-wise Activity Summary (summary table — fine as aggregate)
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