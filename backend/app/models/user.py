import enum
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.worker import WorkerProfile
    from app.models.company import CompanyProfile


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    WORKER = "worker"
    COMPANY = "company"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), unique=True, index=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SqlEnum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.CUSTOMER,
    )
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    language_pref: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    worker_profile: Mapped[Optional["WorkerProfile"]] = relationship(
        "WorkerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    company_profile: Mapped[Optional["CompanyProfile"]] = relationship(
        "CompanyProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
