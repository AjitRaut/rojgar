from typing import List, Optional, Tuple
from sqlalchemy import or_, cast, String
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.schemas.worker import (
    WorkerProfileUpdate,
    WorkerProfileResponse,
    WorkerPublicResponse,
)


class WorkerService:
    def __init__(self, db: Session):
        self.db = db

    def get_my_profile(self, user: User) -> WorkerProfile:
        profile = (
            self.db.query(WorkerProfile)
            .filter(WorkerProfile.user_id == user.id)
            .first()
        )
        if not profile:
            profile = WorkerProfile(user_id=user.id, skills=[])
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def update_my_profile(self, user: User, payload: WorkerProfileUpdate) -> WorkerProfile:
        profile = self.get_my_profile(user)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile

    def get_worker_public(self, user_id: int) -> WorkerPublicResponse:
        record = (
            self.db.query(WorkerProfile, User)
            .join(User, WorkerProfile.user_id == User.id)
            .filter(WorkerProfile.user_id == user_id, User.role == UserRole.WORKER)
            .first()
        )
        if not record:
            raise NotFoundError("Worker")
        profile, user = record
        return self._to_public(profile, user)

    def search_workers(
        self,
        skill: Optional[str] = None,
        city: Optional[str] = None,
        min_rating: Optional[float] = None,
        is_available: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[WorkerPublicResponse], int]:
        query = (
            self.db.query(WorkerProfile, User)
            .join(User, WorkerProfile.user_id == User.id)
            .filter(User.role == UserRole.WORKER, User.is_active.is_(True))
        )

        if skill:
            query = query.filter(
                or_(
                    WorkerProfile.primary_skill.ilike(f"%{skill}%"),
                    cast(WorkerProfile.skills, String).ilike(f"%{skill}%"),
                )
            )
        if city:
            query = query.filter(WorkerProfile.city.ilike(f"%{city}%"))
        if min_rating is not None:
            query = query.filter(WorkerProfile.rating_avg >= min_rating)
        if is_available is not None:
            query = query.filter(WorkerProfile.is_available.is_(is_available))

        total = query.count()
        records = query.offset(skip).limit(limit).all()
        items = [self._to_public(p, u) for p, u in records]
        return items, total

    def _to_public(self, profile: WorkerProfile, user: User) -> WorkerPublicResponse:
        return WorkerPublicResponse(
            id=profile.id,
            user_id=user.id,
            full_name=user.full_name,
            profile_image=user.profile_image,
            primary_skill=profile.primary_skill,
            skills=profile.skills or [],
            experience_years=profile.experience_years,
            daily_rate=profile.daily_rate,
            hourly_rate=profile.hourly_rate,
            city=profile.city,
            state=profile.state,
            bio=profile.bio,
            is_available=profile.is_available,
            is_aadhaar_verified=profile.is_aadhaar_verified,
            rating_avg=profile.rating_avg,
            total_reviews=profile.total_reviews,
            total_jobs_completed=profile.total_jobs_completed,
        )
