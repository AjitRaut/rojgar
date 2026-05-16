from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    JobCategorizeRequest,
    JobCategorizeResponse,
    ProfileOptimizeRequest,
    ProfileOptimizeResponse,
    WageSuggestRequest,
    WageSuggestResponse,
    WorkerRecommendRequest,
    WorkerRecommendResponse,
)
from app.services.ai_service import AIService


router = APIRouter(prefix="/ai", tags=["AI"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with Rojgar Sahayak AI assistant",
)
def chat(
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    return AIService(db).chat(payload)


@router.post(
    "/categorize-job",
    response_model=JobCategorizeResponse,
    summary="Auto-categorize a job description with AI",
)
def categorize_job(
    payload: JobCategorizeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobCategorizeResponse:
    return AIService(db).categorize_job(payload)


@router.post(
    "/suggest-wage",
    response_model=WageSuggestResponse,
    summary="AI-powered fair daily wage suggestion",
)
def suggest_wage(
    payload: WageSuggestRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WageSuggestResponse:
    return AIService(db).suggest_wage(payload)


@router.post(
    "/optimize-profile",
    response_model=ProfileOptimizeResponse,
    summary="AI suggestions to improve worker profile",
)
def optimize_profile(
    payload: ProfileOptimizeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOptimizeResponse:
    return AIService(db).optimize_profile(payload)


@router.post(
    "/recommend-workers",
    response_model=WorkerRecommendResponse,
    summary="AI-ranked worker recommendations for a job",
)
def recommend_workers(
    payload: WorkerRecommendRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkerRecommendResponse:
    return AIService(db).recommend_workers(payload)
