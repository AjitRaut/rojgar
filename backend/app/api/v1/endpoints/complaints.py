from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.services.complaint_service import ComplaintService


router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Raise a complaint",
)
def create_complaint(
    payload: ComplaintCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ComplaintResponse:
    complaint = ComplaintService(db).create(user, payload)
    return ComplaintResponse.model_validate(complaint)


@router.get(
    "/me",
    response_model=List[ComplaintResponse],
    summary="List complaints I raised",
)
def list_my_complaints(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ComplaintResponse]:
    items = ComplaintService(db).list_mine(user)
    return [ComplaintResponse.model_validate(c) for c in items]
