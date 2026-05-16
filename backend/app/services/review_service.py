from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError
from app.models.user import User, UserRole
from app.models.review import Review, ReviewType
from app.models.worker import WorkerProfile
from app.models.job import Job, JobStatus
from app.schemas.review import ReviewCreate


class ReviewService:
    def __init__(self, db: Session):
        self.db = db

    def create_review(self, reviewer: User, payload: ReviewCreate) -> Review:
        if reviewer.id == payload.reviewee_id:
            raise BadRequestError("Cannot review yourself")

        job = self.db.query(Job).filter(Job.id == payload.job_id).first()
        if not job:
            raise NotFoundError("Job")
        if job.status != JobStatus.COMPLETED:
            raise BadRequestError("Reviews can only be left on completed jobs")

        if payload.review_type == ReviewType.CUSTOMER_TO_WORKER:
            if reviewer.role not in (UserRole.CUSTOMER, UserRole.COMPANY):
                raise ForbiddenError("Only customers/companies can leave this review type")
            if job.posted_by_id != reviewer.id:
                raise ForbiddenError("You can only review workers on your own jobs")
        else:
            if reviewer.role != UserRole.WORKER:
                raise ForbiddenError("Only workers can leave this review type")

        existing = (
            self.db.query(Review)
            .filter(
                Review.job_id == payload.job_id,
                Review.reviewer_id == reviewer.id,
                Review.reviewee_id == payload.reviewee_id,
            )
            .first()
        )
        if existing:
            raise BadRequestError("You have already reviewed this user for this job")

        review = Review(
            job_id=payload.job_id,
            reviewer_id=reviewer.id,
            reviewee_id=payload.reviewee_id,
            rating=payload.rating,
            comment=payload.comment,
            review_type=payload.review_type,
        )
        self.db.add(review)
        self.db.flush()

        if payload.review_type == ReviewType.CUSTOMER_TO_WORKER:
            self._recalc_worker_rating(payload.reviewee_id)

        self.db.commit()
        self.db.refresh(review)
        return review

    def list_reviews_for_user(self, user_id: int) -> List[Review]:
        return (
            self.db.query(Review)
            .filter(Review.reviewee_id == user_id)
            .order_by(Review.created_at.desc())
            .all()
        )

    def _recalc_worker_rating(self, worker_user_id: int) -> None:
        result = (
            self.db.query(
                func.avg(Review.rating).label("avg"),
                func.count(Review.id).label("count"),
            )
            .filter(
                Review.reviewee_id == worker_user_id,
                Review.review_type == ReviewType.CUSTOMER_TO_WORKER,
            )
            .first()
        )
        avg = float(result.avg or 0)
        count = int(result.count or 0)

        profile = (
            self.db.query(WorkerProfile)
            .filter(WorkerProfile.user_id == worker_user_id)
            .first()
        )
        if profile:
            profile.rating_avg = round(avg, 2)
            profile.total_reviews = count
