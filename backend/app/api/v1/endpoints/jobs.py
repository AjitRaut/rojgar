from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_customer_or_company,
    require_worker,
)
from app.models.job import JobStatus
from app.models.user import User
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.job import (
    JobApplicationCreate,
    JobApplicationDecision,
    JobApplicationResponse,
    JobCreate,
    JobResponse,
    JobUpdate,
)
from app.services.job_service import JobService
from app.utils.helpers import calculate_total_pages, paginate_params


router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new job (customer or company)",
)
def create_job(
    payload: JobCreate,
    user: User = Depends(require_customer_or_company),
    db: Session = Depends(get_db),
) -> JobResponse:
    job = JobService(db).create_job(user, payload)
    return JobResponse.model_validate(job)


@router.get(
    "",
    response_model=PaginatedResponse[JobResponse],
    summary="List and search jobs",
)
def list_jobs(
    category: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    status_filter: Optional[JobStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse[JobResponse]:
    skip, limit = paginate_params(page, page_size)
    items, total = JobService(db).list_jobs(
        category=category,
        city=city,
        status=status_filter,
        search=search,
        skip=skip,
        limit=limit,
    )
    return PaginatedResponse[JobResponse](
        items=[JobResponse.model_validate(j) for j in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=calculate_total_pages(total, page_size),
    )


@router.get(
    "/my/posted",
    response_model=PaginatedResponse[JobResponse],
    summary="List jobs I have posted",
)
def list_my_posted_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[JobResponse]:
    skip, limit = paginate_params(page, page_size)
    items, total = JobService(db).list_my_posted_jobs(user, skip=skip, limit=limit)
    return PaginatedResponse[JobResponse](
        items=[JobResponse.model_validate(j) for j in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=calculate_total_pages(total, page_size),
    )


@router.get(
    "/my/applications",
    response_model=List[JobApplicationResponse],
    summary="List my job applications (worker only)",
)
def list_my_applications(
    user: User = Depends(require_worker),
    db: Session = Depends(get_db),
) -> List[JobApplicationResponse]:
    items = JobService(db).list_my_applications(user)
    return [JobApplicationResponse.model_validate(a) for a in items]


@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get a job by ID",
)
def get_job(job_id: int, db: Session = Depends(get_db)) -> JobResponse:
    job = JobService(db).get_job(job_id)
    return JobResponse.model_validate(job)


@router.patch(
    "/{job_id}",
    response_model=JobResponse,
    summary="Update a job (owner only)",
)
def update_job(
    job_id: int,
    payload: JobUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobResponse:
    job = JobService(db).update_job(user, job_id, payload)
    return JobResponse.model_validate(job)


@router.delete(
    "/{job_id}",
    response_model=MessageResponse,
    summary="Delete a job (owner only)",
)
def delete_job(
    job_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    JobService(db).delete_job(user, job_id)
    return MessageResponse(message="Job deleted")


@router.post(
    "/{job_id}/apply",
    response_model=JobApplicationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply to a job (worker only)",
)
def apply_to_job(
    job_id: int,
    payload: JobApplicationCreate,
    user: User = Depends(require_worker),
    db: Session = Depends(get_db),
) -> JobApplicationResponse:
    application = JobService(db).apply_to_job(user, job_id, payload)
    return JobApplicationResponse.model_validate(application)


@router.get(
    "/{job_id}/applications",
    response_model=List[JobApplicationResponse],
    summary="List applications on my job",
)
def list_job_applications(
    job_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[JobApplicationResponse]:
    items = JobService(db).list_job_applications(user, job_id)
    return [JobApplicationResponse.model_validate(a) for a in items]


@router.patch(
    "/applications/{application_id}",
    response_model=JobApplicationResponse,
    summary="Accept or reject an application",
)
def decide_application(
    application_id: int,
    payload: JobApplicationDecision,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobApplicationResponse:
    app_record = JobService(db).decide_application(user, application_id, payload.status)
    return JobApplicationResponse.model_validate(app_record)


@router.post(
    "/{job_id}/complete",
    response_model=JobResponse,
    summary="Mark a job as completed (owner only)",
)
def complete_job(
    job_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobResponse:
    job = JobService(db).mark_job_completed(user, job_id)
    return JobResponse.model_validate(job)
