from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    profile_image: Optional[str] = None
    language_pref: Optional[str] = Field(None, max_length=10)


class UserDetailResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    profile_image: Optional[str] = None
    language_pref: str
    is_verified: bool
    is_active: bool

    model_config = {"from_attributes": True}


class UserAdminListResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_verified: bool
    is_active: bool

    model_config = {"from_attributes": True}
