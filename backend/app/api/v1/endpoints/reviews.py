from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.review_service import ReviewService


router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post(
    "",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a review for a completed job",
)
def create_review(
    payload: ReviewCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReviewResponse:
    review = ReviewService(db).create_review(user, payload)
    return ReviewResponse.model_validate(review)


@router.get(
    "/user/{user_id}",
    response_model=List[ReviewResponse],
    summary="List all reviews left for a specific user",
)
def list_reviews_for_user(
    user_id: int, db: Session = Depends(get_db)
) -> List[ReviewResponse]:
    items = ReviewService(db).list_reviews_for_user(user_id)
    return [ReviewResponse.model_validate(r) for r in items]
