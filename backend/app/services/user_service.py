from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError, ConflictError
from app.models.user import User
from app.schemas.user import UserUpdateRequest


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundError("User")
        return user

    def update_profile(self, user: User, payload: UserUpdateRequest) -> User:
        update_data = payload.model_dump(exclude_unset=True)

        if "phone" in update_data and update_data["phone"]:
            conflict = (
                self.db.query(User)
                .filter(User.phone == update_data["phone"], User.id != user.id)
                .first()
            )
            if conflict:
                raise ConflictError("Phone number already used by another account")

        for key, value in update_data.items():
            setattr(user, key, value)

        self.db.commit()
        self.db.refresh(user)
        return user
