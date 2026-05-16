import enum
from typing import Optional
from sqlalchemy import Integer, ForeignKey, Text, CheckConstraint, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import TimestampMixin


class ReviewType(str, enum.Enum):
    CUSTOMER_TO_WORKER = "customer_to_worker"
    WORKER_TO_CUSTOMER = "worker_to_customer"


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reviewer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    reviewee_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_type: Mapped[ReviewType] = mapped_column(
        SqlEnum(ReviewType, name="review_type"),
        nullable=False,
    )
