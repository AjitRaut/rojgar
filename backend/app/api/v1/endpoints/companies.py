from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_company
from app.models.user import User
from app.schemas.company import CompanyProfileResponse, CompanyProfileUpdate
from app.services.company_service import CompanyService


router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get(
    "/me",
    response_model=CompanyProfileResponse,
    summary="Get my company profile",
)
def get_my_company_profile(
    user: User = Depends(require_company),
    db: Session = Depends(get_db),
) -> CompanyProfileResponse:
    profile = CompanyService(db).get_my_profile(user)
    return CompanyProfileResponse.model_validate(profile)


@router.patch(
    "/me",
    response_model=CompanyProfileResponse,
    summary="Update my company profile",
)
def update_my_company_profile(
    payload: CompanyProfileUpdate,
    user: User = Depends(require_company),
    db: Session = Depends(get_db),
) -> CompanyProfileResponse:
    profile = CompanyService(db).update_my_profile(user, payload)
    return CompanyProfileResponse.model_validate(profile)
