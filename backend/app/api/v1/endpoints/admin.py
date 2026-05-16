from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.exceptions import NotFoundError
from app.models.complaint import Complaint, ComplaintStatus
from app.models.company import CompanyProfile
from app.models.job import Job, JobStatus
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.complaint import ComplaintResponse, ComplaintUpdateByAdmin
from app.schemas.user import UserAdminListResponse
from app.services.complaint_service import ComplaintService
from app.utils.helpers import calculate_total_pages, paginate_params


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.get(
    "/users",
    response_model=PaginatedResponse[UserAdminListResponse],
    summary="List all users (admin)",
)
def list_users(
    role: Optional[UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> PaginatedResponse[UserAdminListResponse]:
    skip, limit = paginate_params(page, page_size)
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active.is_(is_active))
    total = query.count()
    items = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse[UserAdminListResponse](
        items=[UserAdminListResponse.model_validate(u) for u in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=calculate_total_pages(total, page_size),
    )


@router.post(
    "/users/{user_id}/toggle-active",
    response_model=MessageResponse,
    summary="Activate or deactivate a user account",
)
def toggle_user_active(user_id: int, db: Session = Depends(get_db)) -> MessageResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User")
    user.is_active = not user.is_active
    db.commit()
    state = "activated" if user.is_active else "deactivated"
    return MessageResponse(message=f"User {state}")


@router.post(
    "/users/{user_id}/verify",
    response_model=MessageResponse,
    summary="Mark a user as verified",
)
def verify_user(user_id: int, db: Session = Depends(get_db)) -> MessageResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User")
    user.is_verified = True

    if user.role == UserRole.WORKER:
        wp = db.query(WorkerProfile).filter(WorkerProfile.user_id == user_id).first()
        if wp:
            wp.is_aadhaar_verified = True
    elif user.role == UserRole.COMPANY:
        cp = db.query(CompanyProfile).filter(CompanyProfile.user_id == user_id).first()
        if cp:
            cp.is_gst_verified = True

    db.commit()
    return MessageResponse(message="User verified")


@router.get(
    "/complaints",
    response_model=List[ComplaintResponse],
    summary="List all complaints",
)
def list_all_complaints(db: Session = Depends(get_db)) -> List[ComplaintResponse]:
    items = ComplaintService(db).list_all()
    return [ComplaintResponse.model_validate(c) for c in items]


@router.patch(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse,
    summary="Update a complaint status",
)
def update_complaint(
    complaint_id: int,
    payload: ComplaintUpdateByAdmin,
    db: Session = Depends(get_db),
) -> ComplaintResponse:
    complaint = ComplaintService(db).update_by_admin(complaint_id, payload)
    return ComplaintResponse.model_validate(complaint)


@router.get("/analytics/overview", summary="Platform analytics overview")
def analytics_overview(db: Session = Depends(get_db)) -> dict:
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_workers = (
        db.query(func.count(User.id)).filter(User.role == UserRole.WORKER).scalar() or 0
    )
    total_customers = (
        db.query(func.count(User.id)).filter(User.role == UserRole.CUSTOMER).scalar() or 0
    )
    total_companies = (
        db.query(func.count(User.id)).filter(User.role == UserRole.COMPANY).scalar() or 0
    )
    total_jobs = db.query(func.count(Job.id)).scalar() or 0
    open_jobs = db.query(func.count(Job.id)).filter(Job.status == JobStatus.OPEN).scalar() or 0
    in_progress_jobs = (
        db.query(func.count(Job.id)).filter(Job.status == JobStatus.IN_PROGRESS).scalar() or 0
    )
    completed_jobs = (
        db.query(func.count(Job.id)).filter(Job.status == JobStatus.COMPLETED).scalar() or 0
    )
    open_complaints = (
        db.query(func.count(Complaint.id))
        .filter(Complaint.status == ComplaintStatus.OPEN)
        .scalar()
        or 0
    )
    pending_verifications = (
        db.query(func.count(User.id))
        .filter(User.is_verified.is_(False), User.role != UserRole.ADMIN)
        .scalar()
        or 0
    )

    return {
        "users": {
            "total": total_users,
            "workers": total_workers,
            "customers": total_customers,
            "companies": total_companies,
        },
        "jobs": {
            "total": total_jobs,
            "open": open_jobs,
            "in_progress": in_progress_jobs,
            "completed": completed_jobs,
        },
        "complaints": {
            "open": open_complaints,
        },
        "verifications": {
            "pending": pending_verifications,
        },
    }
