from pydantic import BaseModel
from typing import Optional
from datetime import date


class ReportDateFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class UserSummaryRow(BaseModel):
    role: str
    total: int
    verified: int
    active: int
    inactive: int


class JobSummaryRow(BaseModel):
    status: str
    count: int
    avg_daily_wage: float
    total_budget: float


class JobCategoryRow(BaseModel):
    category: str
    total_jobs: int
    open_jobs: int
    completed_jobs: int
    avg_wage: float


class WorkerSkillRow(BaseModel):
    primary_skill: str
    worker_count: int
    avg_rating: float
    avg_daily_rate: float
    verified_count: int


class CityActivityRow(BaseModel):
    city: str
    total_jobs: int
    total_workers: int
    total_companies: int


class ApplicationStatsRow(BaseModel):
    status: str
    count: int
    percentage: float


class ComplaintSummaryRow(BaseModel):
    status: str
    count: int


class CompanySubscriptionRow(BaseModel):
    subscription_tier: str
    company_count: int
    verified_count: int


class TopWorkerRow(BaseModel):
    worker_id: int
    full_name: str
    primary_skill: str
    city: str
    rating_avg: float
    total_jobs_completed: int
    daily_rate: Optional[float]