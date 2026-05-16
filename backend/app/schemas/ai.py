from typing import Optional, List
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    model: str


class JobCategorizeRequest(BaseModel):
    description: str = Field(..., min_length=5, max_length=2000)


class JobCategorizeResponse(BaseModel):
    category: str
    suggested_skills: List[str]
    suggested_title: str


class WageSuggestRequest(BaseModel):
    skill: str = Field(..., min_length=2)
    city: str = Field(..., min_length=2)
    experience_years: int = Field(0, ge=0, le=80)


class WageSuggestResponse(BaseModel):
    suggested_daily_wage: float
    min_wage: float
    max_wage: float
    reasoning: str


class ProfileOptimizeRequest(BaseModel):
    bio: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience_years: int = 0


class ProfileOptimizeResponse(BaseModel):
    suggestions: List[str]
    improved_bio: str


class WorkerRecommendRequest(BaseModel):
    job_description: str = Field(..., min_length=5)
    city: Optional[str] = None
    skill: Optional[str] = None
    limit: int = Field(5, ge=1, le=20)


class RecommendedWorker(BaseModel):
    worker_id: int
    full_name: str
    primary_skill: Optional[str]
    city: Optional[str]
    rating_avg: float
    match_score: float
    match_reason: str


class WorkerRecommendResponse(BaseModel):
    workers: List[RecommendedWorker]
