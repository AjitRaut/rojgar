from fastapi import APIRouter
from app.api.v1.endpoints import (
    admin,
    ai,
    auth,
    companies,
    complaints,
    jobs,
    reports,
    reviews,
    uploads,
    users,
    workers,
)


api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(workers.router)
api_router.include_router(companies.router)
api_router.include_router(jobs.router)
api_router.include_router(reviews.router)
api_router.include_router(complaints.router)
api_router.include_router(admin.router)
api_router.include_router(ai.router)
api_router.include_router(uploads.router)
api_router.include_router(reports.router)