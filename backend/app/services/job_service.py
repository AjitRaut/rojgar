from typing import List, Optional, Tuple
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.models.job import Job, JobApplication, JobStatus, ApplicationStatus
from app.models.user import User, UserRole
from app.schemas.job import JobCreate, JobUpdate, JobApplicationCreate


class JobService:
    def __init__(self, db: Session):
        self.db = db

    def create_job(self, user: User, payload: JobCreate) -> Job:
        if user.role not in (UserRole.CUSTOMER, UserRole.COMPANY):
            raise ForbiddenError("Only customers or companies can post jobs")
        job = Job(posted_by_id=user.id, **payload.model_dump())
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def update_job(self, user: User, job_id: int, payload: JobUpdate) -> Job:
        job = self._get_job_or_404(job_id)
        if job.posted_by_id != user.id and user.role != UserRole.ADMIN:
            raise ForbiddenError("You can only update your own jobs")
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(job, key, value)
        self.db.commit()
        self.db.refresh(job)
        return job

    def delete_job(self, user: User, job_id: int) -> None:
        job = self._get_job_or_404(job_id)
        if job.posted_by_id != user.id and user.role != UserRole.ADMIN:
            raise ForbiddenError("You can only delete your own jobs")
        self.db.delete(job)
        self.db.commit()

    def get_job(self, job_id: int) -> Job:
        return self._get_job_or_404(job_id)

    def list_jobs(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        status: Optional[JobStatus] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Job], int]:
        query = self.db.query(Job)
        if category:
            query = query.filter(Job.category.ilike(f"%{category}%"))
        if city:
            query = query.filter(Job.city.ilike(f"%{city}%"))
        if status:
            query = query.filter(Job.status == status)
        if search:
            query = query.filter(
                or_(
                    Job.title.ilike(f"%{search}%"),
                    Job.description.ilike(f"%{search}%"),
                )
            )
        total = query.count()
        items = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def list_my_posted_jobs(self, user: User, skip: int = 0, limit: int = 20) -> Tuple[List[Job], int]:
        query = self.db.query(Job).filter(Job.posted_by_id == user.id)
        total = query.count()
        items = query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    def apply_to_job(
        self, worker: User, job_id: int, payload: JobApplicationCreate
    ) -> JobApplication:
        if worker.role != UserRole.WORKER:
            raise ForbiddenError("Only workers can apply to jobs")

        job = self._get_job_or_404(job_id)
        if job.status != JobStatus.OPEN:
            raise BadRequestError("This job is no longer accepting applications")
        if job.posted_by_id == worker.id:
            raise BadRequestError("You cannot apply to your own job")

        existing = (
            self.db.query(JobApplication)
            .filter(JobApplication.job_id == job_id, JobApplication.worker_id == worker.id)
            .first()
        )
        if existing:
            raise BadRequestError("You have already applied to this job")

        application = JobApplication(
            job_id=job_id,
            worker_id=worker.id,
            cover_message=payload.cover_message,
            proposed_rate=payload.proposed_rate,
        )
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def list_job_applications(self, user: User, job_id: int) -> List[JobApplication]:
        job = self._get_job_or_404(job_id)
        if job.posted_by_id != user.id and user.role != UserRole.ADMIN:
            raise ForbiddenError("You can only view applications on your own jobs")
        return (
            self.db.query(JobApplication)
            .filter(JobApplication.job_id == job_id)
            .order_by(JobApplication.created_at.desc())
            .all()
        )

    def list_my_applications(self, worker: User) -> List[JobApplication]:
        if worker.role != UserRole.WORKER:
            raise ForbiddenError("Only workers have applications")
        return (
            self.db.query(JobApplication)
            .filter(JobApplication.worker_id == worker.id)
            .order_by(JobApplication.created_at.desc())
            .all()
        )

    def decide_application(
        self, user: User, application_id: int, new_status: ApplicationStatus
    ) -> JobApplication:
        application = (
            self.db.query(JobApplication)
            .filter(JobApplication.id == application_id)
            .first()
        )
        if not application:
            raise NotFoundError("Application")

        job = self._get_job_or_404(application.job_id)
        if job.posted_by_id != user.id and user.role != UserRole.ADMIN:
            raise ForbiddenError("You can only manage applications on your own jobs")

        if new_status not in (ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED):
            raise BadRequestError("Status must be 'accepted' or 'rejected'")

        application.status = new_status
        if new_status == ApplicationStatus.ACCEPTED:
            job.status = JobStatus.IN_PROGRESS

        self.db.commit()
        self.db.refresh(application)
        return application

    def mark_job_completed(self, user: User, job_id: int) -> Job:
        job = self._get_job_or_404(job_id)
        if job.posted_by_id != user.id and user.role != UserRole.ADMIN:
            raise ForbiddenError("You can only complete your own jobs")
        if job.status not in (JobStatus.IN_PROGRESS, JobStatus.OPEN):
            raise BadRequestError("Job cannot be completed from its current state")

        job.status = JobStatus.COMPLETED

        accepted = (
            self.db.query(JobApplication)
            .filter(
                JobApplication.job_id == job.id,
                JobApplication.status == ApplicationStatus.ACCEPTED,
            )
            .all()
        )
        from app.models.worker import WorkerProfile
        for app in accepted:
            wp = (
                self.db.query(WorkerProfile)
                .filter(WorkerProfile.user_id == app.worker_id)
                .first()
            )
            if wp:
                wp.total_jobs_completed = (wp.total_jobs_completed or 0) + 1

        self.db.commit()
        self.db.refresh(job)
        return job

    def _get_job_or_404(self, job_id: int) -> Job:
        job = self.db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise NotFoundError("Job")
        return job
