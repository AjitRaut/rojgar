from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.review import ReviewType


class ReviewCreate(BaseModel):
    job_id: int
    reviewee_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    review_type: ReviewType


class ReviewResponse(BaseModel):
    id: int
    job_id: int
    reviewer_id: int
    reviewee_id: int
    rating: int
    comment: Optional[str]
    review_type: ReviewType
    created_at: datetime

    model_config = {"from_attributes": True}
