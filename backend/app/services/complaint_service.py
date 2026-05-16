from typing import List
from sqlalchemy.orm import Session
from app.core.exceptions import NotFoundError, ForbiddenError
from app.models.user import User, UserRole
from app.models.complaint import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintUpdateByAdmin


class ComplaintService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: User, payload: ComplaintCreate) -> Complaint:
        complaint = Complaint(
            raised_by_id=user.id,
            against_id=payload.against_id,
            job_id=payload.job_id,
            subject=payload.subject,
            description=payload.description,
        )
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def list_mine(self, user: User) -> List[Complaint]:
        return (
            self.db.query(Complaint)
            .filter(Complaint.raised_by_id == user.id)
            .order_by(Complaint.created_at.desc())
            .all()
        )

    def list_all(self) -> List[Complaint]:
        return self.db.query(Complaint).order_by(Complaint.created_at.desc()).all()

    def update_by_admin(self, complaint_id: int, payload: ComplaintUpdateByAdmin) -> Complaint:
        complaint = self.db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not complaint:
            raise NotFoundError("Complaint")
        complaint.status = payload.status
        if payload.admin_response is not None:
            complaint.admin_response = payload.admin_response
        self.db.commit()
        self.db.refresh(complaint)
        return complaint
