import enum
from typing import Optional
from sqlalchemy import String, ForeignKey, Text, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import TimestampMixin


class ComplaintStatus(str, enum.Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    raised_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    against_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    job_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
    )

    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ComplaintStatus] = mapped_column(
        SqlEnum(ComplaintStatus, name="complaint_status"),
        default=ComplaintStatus.OPEN,
        nullable=False,
    )
    admin_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
