"""
Admin Reports Endpoint — 8 descriptive PDF reports for the admin panel.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.services.report_service import ReportService
from app.utils.pdf_generator import generate_table_pdf

router = APIRouter(
    prefix="/admin/reports",
    tags=["Admin Reports"],
    dependencies=[Depends(require_admin)],
)

_PDF_MIME = "application/pdf"


def _pdf_response(data: bytes, filename: str) -> Response:
    return Response(
        content=data,
        media_type=_PDF_MIME,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _date_subtitle(start_date: Optional[date], end_date: Optional[date]) -> str:
    if start_date and end_date:
        return f"Period: {start_date} to {end_date}"
    if start_date:
        return f"From: {start_date}"
    if end_date:
        return f"Up to: {end_date}"
    return "All time"


# ──────────────────────────────────────────────────────────────────────────────
# Report 1: User Registration Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/user-registration", summary="Download User Registration Report PDF")
def report_user_registration(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.user_registration_report(start_date, end_date)

    headers = ["#", "Full Name", "Email", "Phone", "Role", "Verified", "Active", "Registered On"]
    rows = [
        [
            i + 1,
            d["full_name"],
            d["email"],
            d["phone"],
            d["role"].capitalize(),
            d["is_verified"],
            d["is_active"],
            d["registered_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="User Registration Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "user_registration_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 2: Job Listings Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/job-listings", summary="Download Job Listings Report PDF")
def report_job_listings(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.job_listings_report(start_date, end_date)

    headers = ["#", "Job Title", "Posted By", "Category", "City", "Daily Wage (₹)", "Workers Needed", "Duration (Days)", "Status", "Urgent", "Posted On"]
    rows = [
        [
            i + 1,
            d["title"],
            d["posted_by"],
            d["category"],
            d["city"],
            f"₹{d['daily_wage']:,.2f}",
            d["workers_needed"],
            d["duration_days"],
            d["status"],
            d["is_urgent"],
            d["posted_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="Job Listings Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "job_listings_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 3: Job Applications Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/job-applications", summary="Download Job Applications Report PDF")
def report_job_applications(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.job_applications_report(start_date, end_date)

    headers = ["#", "Worker Name", "Worker Email", "Job Title", "City", "Status", "Proposed Rate", "Applied On"]
    rows = [
        [
            i + 1,
            d["worker_name"],
            d["worker_email"],
            d["job_title"],
            d["job_city"],
            d["status"],
            d["proposed_rate"],
            d["applied_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="Job Applications Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "job_applications_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 4: Worker Profiles Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/worker-profiles", summary="Download Worker Profiles Report PDF")
def report_worker_profiles(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.worker_profiles_report(start_date, end_date)

    headers = ["#", "Full Name", "Email", "Primary Skill", "City", "Daily Rate", "Exp (Yrs)", "Rating", "Jobs Done", "Available", "Aadhaar Verified", "Joined On"]
    rows = [
        [
            i + 1,
            d["full_name"],
            d["email"],
            d["primary_skill"],
            d["city"],
            d["daily_rate"],
            d["experience_years"],
            f"{d['rating_avg']} ★",
            d["total_jobs_completed"],
            d["is_available"],
            d["aadhaar_verified"],
            d["joined_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="Worker Profiles Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "worker_profiles_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 5: Company Profiles Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/company-profiles", summary="Download Company Profiles Report PDF")
def report_company_profiles(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.company_profiles_report(start_date, end_date)

    headers = ["#", "Company Name", "Type", "Email", "City", "State", "Subscription", "GST Verified", "Jobs Posted", "Registered On"]
    rows = [
        [
            i + 1,
            d["company_name"],
            d["company_type"],
            d["email"],
            d["city"],
            d["state"],
            d["subscription_tier"],
            d["gst_verified"],
            d["total_jobs_posted"],
            d["registered_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="Company Profiles Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "company_profiles_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 6: Complaint Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/complaints", summary="Download Complaint Report PDF")
def report_complaints(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.complaint_report(start_date, end_date)

    headers = ["#", "Subject", "Filed By", "Email", "Against", "Related Job", "Status", "Filed On"]
    rows = [
        [
            i + 1,
            d["subject"],
            d["raised_by"],
            d["raised_by_email"],
            d["against"],
            d["related_job"],
            d["status"],
            d["filed_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="Complaint Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "complaint_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 7: Reviews & Ratings Report
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/reviews", summary="Download Reviews & Ratings Report PDF")
def report_reviews(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.reviews_report(start_date, end_date)

    headers = ["#", "Reviewer", "Reviewee", "Job Title", "Rating", "Comment", "Type", "Date"]
    rows = [
        [
            i + 1,
            d["reviewer"],
            d["reviewee"],
            d["job_title"],
            f"{d['rating']} ★",
            d["comment"][:60] + "..." if len(d["comment"]) > 60 else d["comment"],
            d["review_type"],
            d["reviewed_on"],
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="Reviews & Ratings Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "reviews_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 8: City-wise Activity Summary
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/city-activity", summary="Download City-wise Activity Summary PDF")
def report_city_activity(db: Session = Depends(get_db)):
    svc = ReportService(db)
    data = svc.city_activity_report()

    headers = ["#", "City", "Total Jobs", "Total Workers", "Total Companies"]
    rows = [
        [i + 1, d["city"], d["total_jobs"], d["total_workers"], d["total_companies"]]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title="City-wise Activity Summary",
        subtitle="Top 20 cities by job count",
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "city_activity_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report metadata endpoint (used by frontend to list reports)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/list", summary="List all available reports")
def list_reports(_: User = Depends(require_admin)):
    return [
        {
            "id": "user-registration",
            "title": "User Registration Report",
            "description": "All registered users with name, email, role, verification and active status.",
            "has_date_filter": True,
            "icon": "Users",
        },
        {
            "id": "job-listings",
            "title": "Job Listings Report",
            "description": "All jobs with title, company, category, city, wage, status and posted date.",
            "has_date_filter": True,
            "icon": "Briefcase",
        },
        {
            "id": "job-applications",
            "title": "Job Applications Report",
            "description": "All applications with worker name, job title, status and applied date.",
            "has_date_filter": True,
            "icon": "ClipboardList",
        },
        {
            "id": "worker-profiles",
            "title": "Worker Profiles Report",
            "description": "All workers with skill, city, daily rate, rating and Aadhaar verification.",
            "has_date_filter": True,
            "icon": "Wrench",
        },
        {
            "id": "company-profiles",
            "title": "Company Profiles Report",
            "description": "All companies with type, city, subscription tier, GST status and jobs posted.",
            "has_date_filter": True,
            "icon": "Building2",
        },
        {
            "id": "complaints",
            "title": "Complaint Report",
            "description": "All complaints with subject, filed by, against whom, related job and status.",
            "has_date_filter": True,
            "icon": "ShieldAlert",
        },
        {
            "id": "reviews",
            "title": "Reviews & Ratings Report",
            "description": "All reviews with reviewer, reviewee, job title, rating and comment.",
            "has_date_filter": True,
            "icon": "Star",
        },
        {
            "id": "city-activity",
            "title": "City-wise Activity Summary",
            "description": "Top 20 cities ranked by total jobs, workers and companies.",
            "has_date_filter": False,
            "icon": "MapPin",
        },
    ]