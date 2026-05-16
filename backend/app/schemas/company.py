from typing import Optional
from pydantic import BaseModel, Field
from app.models.company import SubscriptionTier


class CompanyProfileCreate(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200)
    company_type: Optional[str] = Field(None, max_length=100)
    gst_number: Optional[str] = Field(None, max_length=50)
    registration_number: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None


class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=200)
    company_type: Optional[str] = Field(None, max_length=100)
    gst_number: Optional[str] = Field(None, max_length=50)
    registration_number: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=300)
    description: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pincode: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None


class CompanyProfileResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    company_type: Optional[str]
    gst_number: Optional[str]
    registration_number: Optional[str]
    website: Optional[str]
    description: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    address: Optional[str]
    is_gst_verified: bool
    subscription_tier: SubscriptionTier

    model_config = {"from_attributes": True}
