from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserDetailResponse, UserUpdateRequest
from app.services.user_service import UserService


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserDetailResponse, summary="Get my profile")
def get_me(user: User = Depends(get_current_user)) -> UserDetailResponse:
    return UserDetailResponse.model_validate(user)


@router.patch("/me", response_model=UserDetailResponse, summary="Update my profile")
def update_me(
    payload: UserUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserDetailResponse:
    updated = UserService(db).update_profile(user, payload)
    return UserDetailResponse.model_validate(updated)
