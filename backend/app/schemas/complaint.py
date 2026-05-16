from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.complaint import ComplaintStatus


class ComplaintCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    against_id: Optional[int] = None
    job_id: Optional[int] = None


class ComplaintUpdateByAdmin(BaseModel):
    status: ComplaintStatus
    admin_response: Optional[str] = None


class ComplaintResponse(BaseModel):
    id: int
    raised_by_id: int
    against_id: Optional[int]
    job_id: Optional[int]
    subject: str
    description: str
    status: ComplaintStatus
    admin_response: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
