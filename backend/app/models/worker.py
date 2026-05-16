from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class WorkerProfile(Base, TimestampMixin):
    __tablename__ = "worker_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    skills: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    primary_skill: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hourly_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    daily_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    city: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), index=True, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_aadhaar_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    rating_avg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_jobs_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="worker_profile")
