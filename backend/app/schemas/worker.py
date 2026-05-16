from typing import Optional, List
from pydantic import BaseModel, Field


class WorkerProfileCreate(BaseModel):
    skills: List[str] = Field(default_factory=list)
    primary_skill: Optional[str] = Field(None, max_length=100)
    experience_years: int = Field(0, ge=0, le=80)
    hourly_rate: Optional[float] = Field(None, ge=0)
    daily_rate: Optional[float] = Field(None, ge=0)
    bio: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    is_available: bool = True


class WorkerProfileUpdate(BaseModel):
    skills: Optional[List[str]] = None
    primary_skill: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[int] = Field(None, ge=0, le=80)
    hourly_rate: Optional[float] = Field(None, ge=0)
    daily_rate: Optional[float] = Field(None, ge=0)
    bio: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    is_available: Optional[bool] = None


class WorkerProfileResponse(BaseModel):
    id: int
    user_id: int
    skills: List[str]
    primary_skill: Optional[str]
    experience_years: int
    hourly_rate: Optional[float]
    daily_rate: Optional[float]
    bio: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    address: Optional[str]
    is_available: bool
    is_aadhaar_verified: bool
    rating_avg: float
    total_reviews: int
    total_jobs_completed: int

    model_config = {"from_attributes": True}


class WorkerPublicResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    profile_image: Optional[str] = None
    primary_skill: Optional[str]
    skills: List[str]
    experience_years: int
    daily_rate: Optional[float]
    hourly_rate: Optional[float]
    city: Optional[str]
    state: Optional[str]
    bio: Optional[str]
    is_available: bool
    is_aadhaar_verified: bool
    rating_avg: float
    total_reviews: int
    total_jobs_completed: int

    model_config = {"from_attributes": True}
