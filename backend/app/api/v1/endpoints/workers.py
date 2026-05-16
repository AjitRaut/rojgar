from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_worker
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.worker import (
    WorkerProfileResponse,
    WorkerProfileUpdate,
    WorkerPublicResponse,
)
from app.services.worker_service import WorkerService
from app.utils.helpers import calculate_total_pages, paginate_params


router = APIRouter(prefix="/workers", tags=["Workers"])


@router.get(
    "/me",
    response_model=WorkerProfileResponse,
    summary="Get my worker profile",
)
def get_my_worker_profile(
    user: User = Depends(require_worker),
    db: Session = Depends(get_db),
) -> WorkerProfileResponse:
    profile = WorkerService(db).get_my_profile(user)
    return WorkerProfileResponse.model_validate(profile)


@router.patch(
    "/me",
    response_model=WorkerProfileResponse,
    summary="Update my worker profile",
)
def update_my_worker_profile(
    payload: WorkerProfileUpdate,
    user: User = Depends(require_worker),
    db: Session = Depends(get_db),
) -> WorkerProfileResponse:
    profile = WorkerService(db).update_my_profile(user, payload)
    return WorkerProfileResponse.model_validate(profile)


@router.get(
    "",
    response_model=PaginatedResponse[WorkerPublicResponse],
    summary="Search and list workers (public)",
)
def list_workers(
    skill: Optional[str] = Query(None, description="Filter by skill"),
    city: Optional[str] = Query(None, description="Filter by city"),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    is_available: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse[WorkerPublicResponse]:
    skip, limit = paginate_params(page, page_size)
    items, total = WorkerService(db).search_workers(
        skill=skill,
        city=city,
        min_rating=min_rating,
        is_available=is_available,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse[WorkerPublicResponse](
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=calculate_total_pages(total, page_size),
    )


@router.get(
    "/{user_id}",
    response_model=WorkerPublicResponse,
    summary="Get a worker's public profile by user_id",
)
def get_worker(user_id: int, db: Session = Depends(get_db)) -> WorkerPublicResponse:
    return WorkerService(db).get_worker_public(user_id)
