from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError, ConflictError
from app.models.user import User
from app.models.company import CompanyProfile
from app.schemas.company import CompanyProfileUpdate


class CompanyService:
    def __init__(self, db: Session):
        self.db = db

    def get_my_profile(self, user: User) -> CompanyProfile:
        profile = (
            self.db.query(CompanyProfile)
            .filter(CompanyProfile.user_id == user.id)
            .first()
        )
        if not profile:
            profile = CompanyProfile(
                user_id=user.id,
                company_name=user.full_name,
            )
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        return profile

    def update_my_profile(self, user: User, payload: CompanyProfileUpdate) -> CompanyProfile:
        profile = self.get_my_profile(user)
        data = payload.model_dump(exclude_unset=True)

        if "gst_number" in data and data["gst_number"]:
            existing = (
                self.db.query(CompanyProfile)
                .filter(
                    CompanyProfile.gst_number == data["gst_number"],
                    CompanyProfile.user_id != user.id,
                )
                .first()
            )
            if existing:
                raise ConflictError("GST number already registered with another company")

        for key, value in data.items():
            setattr(profile, key, value)

        self.db.commit()
        self.db.refresh(profile)
        return profile
