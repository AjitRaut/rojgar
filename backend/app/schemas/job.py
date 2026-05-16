from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.job import JobStatus, ApplicationStatus


class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = Field(..., min_length=2, max_length=100)
    skills_required: List[str] = Field(default_factory=list)
    workers_needed: int = Field(1, ge=1, le=500)
    daily_wage: float = Field(..., gt=0)
    total_budget: Optional[float] = Field(None, gt=0)
    duration_days: int = Field(1, ge=1, le=365)
    city: str = Field(..., min_length=2, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    start_date: Optional[date] = None
    is_urgent: bool = False


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = Field(None, max_length=100)
    skills_required: Optional[List[str]] = None
    workers_needed: Optional[int] = Field(None, ge=1, le=500)
    daily_wage: Optional[float] = Field(None, gt=0)
    total_budget: Optional[float] = Field(None, gt=0)
    duration_days: Optional[int] = Field(None, ge=1, le=365)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    start_date: Optional[date] = None
    status: Optional[JobStatus] = None
    is_urgent: Optional[bool] = None


class PosterMini(BaseModel):
    id: int
    full_name: str
    role: str

    model_config = {"from_attributes": True}


class JobResponse(BaseModel):
    id: int
    posted_by_id: int
    title: str
    description: str
    category: str
    skills_required: List[str]
    workers_needed: int
    daily_wage: float
    total_budget: Optional[float]
    duration_days: int
    city: str
    state: Optional[str]
    pincode: Optional[str]
    address: Optional[str]
    start_date: Optional[date]
    status: JobStatus
    is_urgent: bool
    created_at: datetime
    poster: Optional[PosterMini] = None

    model_config = {"from_attributes": True}


class JobApplicationCreate(BaseModel):
    cover_message: Optional[str] = None
    proposed_rate: Optional[float] = Field(None, gt=0)


class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    worker_id: int
    status: ApplicationStatus
    cover_message: Optional[str]
    proposed_rate: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class JobApplicationDecision(BaseModel):
    status: ApplicationStatus
