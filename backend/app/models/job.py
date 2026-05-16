import enum
from datetime import date
from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Text, Date, JSON, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class JobStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    CLOSED = "closed"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    posted_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    skills_required: Mapped[list] = mapped_column(JSON, default=list, nullable=False)

    workers_needed: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    daily_wage: Mapped[float] = mapped_column(Float, nullable=False)
    total_budget: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    duration_days: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[JobStatus] = mapped_column(
        SqlEnum(JobStatus, name="job_status"),
        default=JobStatus.OPEN,
        nullable=False,
        index=True,
    )
    is_urgent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    poster = relationship("User", foreign_keys=[posted_by_id], lazy="joined")
    applications = relationship(
        "JobApplication",
        back_populates="job",
        cascade="all, delete-orphan",
    )


class JobApplication(Base, TimestampMixin):
    __tablename__ = "job_applications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    worker_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status: Mapped[ApplicationStatus] = mapped_column(
        SqlEnum(ApplicationStatus, name="application_status"),
        default=ApplicationStatus.APPLIED,
        nullable=False,
    )
    cover_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    proposed_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    job = relationship("Job", back_populates="applications")
    worker = relationship("User", foreign_keys=[worker_id], lazy="joined")
