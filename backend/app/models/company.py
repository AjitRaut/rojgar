import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, ForeignKey, Text, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class CompanyProfile(Base, TimestampMixin):
    __tablename__ = "company_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    company_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    company_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gst_number: Mapped[Optional[str]] = mapped_column(String(50), unique=True, nullable=True)
    registration_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    city: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_gst_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    subscription_tier: Mapped[SubscriptionTier] = mapped_column(
        SqlEnum(SubscriptionTier, name="subscription_tier"),
        default=SubscriptionTier.FREE,
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="company_profile")
