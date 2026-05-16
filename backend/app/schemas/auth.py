from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    role: UserRole = UserRole.CUSTOMER

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: UserRole) -> UserRole:
        if v == UserRole.ADMIN:
            raise ValueError("Cannot register as admin")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    profile_image: Optional[str] = None
    language_pref: str
    is_verified: bool
    is_active: bool

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
