"""
Admin Reports Endpoint
8 downloadable PDF reports for the admin panel.

Add to router.py:
    from app.api.v1.endpoints import reports
    api_router.include_router(reports.router)
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
# Report 1: User Registration Summary
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/user-registration", summary="Download User Registration Summary PDF")
def report_user_registration(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.user_registration_report(start_date, end_date)

    headers = ["Role", "Total", "Verified", "Active", "Inactive"]
    rows = [
        [d["role"].capitalize(), d["total"], d["verified"], d["active"], d["inactive"]]
        for d in data
    ]

    pdf = generate_table_pdf(
        title="User Registration Summary",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "user_registration_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 2: Job Status Summary
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/job-status", summary="Download Job Status Summary PDF")
def report_job_status(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.job_status_report(start_date, end_date)

    headers = ["Status", "Count", "Avg Daily Wage (₹)", "Total Budget (₹)"]
    rows = [
        [
            d["status"].replace("_", " ").capitalize(),
            d["count"],
            f"₹{d['avg_daily_wage']:,.2f}",
            f"₹{d['total_budget']:,.2f}",
        ]
        for d in data
    ]

    pdf = generate_table_pdf(
        title="Job Status Summary",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "job_status_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 3: Jobs by Category
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/job-category", summary="Download Job Category Report PDF")
def report_job_category(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.job_category_report(start_date, end_date)

    headers = ["Category", "Total Jobs", "Open", "Completed", "Avg Wage (₹)"]
    rows = [
        [
            d["category"],
            d["total_jobs"],
            d["open_jobs"],
            d["completed_jobs"],
            f"₹{d['avg_wage']:,.2f}",
        ]
        for d in data
    ]

    pdf = generate_table_pdf(
        title="Jobs by Category",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "job_category_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 4: Worker Skills Distribution
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/worker-skills", summary="Download Worker Skills Distribution PDF")
def report_worker_skills(db: Session = Depends(get_db)):
    svc = ReportService(db)
    data = svc.worker_skills_report()

    headers = ["Primary Skill", "Workers", "Avg Rating", "Avg Daily Rate (₹)", "Verified"]
    rows = [
        [
            d["primary_skill"],
            d["worker_count"],
            f"{d['avg_rating']:.1f} ★",
            f"₹{d['avg_daily_rate']:,.0f}",
            d["verified_count"],
        ]
        for d in data
    ]

    pdf = generate_table_pdf(
        title="Worker Skills Distribution",
        subtitle="All time snapshot",
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "worker_skills_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 5: City-wise Activity
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/city-activity", summary="Download City-wise Activity PDF")
def report_city_activity(db: Session = Depends(get_db)):
    svc = ReportService(db)
    data = svc.city_activity_report()

    headers = ["City", "Total Jobs", "Total Workers", "Total Companies"]
    rows = [
        [d["city"], d["total_jobs"], d["total_workers"], d["total_companies"]]
        for d in data
    ]

    pdf = generate_table_pdf(
        title="City-wise Activity Report",
        subtitle="Top 20 cities by job count",
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "city_activity_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 6: Application Status Distribution
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/application-stats", summary="Download Application Stats PDF")
def report_application_stats(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.application_stats_report(start_date, end_date)

    headers = ["Application Status", "Count", "Percentage"]
    rows = [
        [d["status"].capitalize(), d["count"], f"{d['percentage']}%"]
        for d in data
    ]

    pdf = generate_table_pdf(
        title="Application Status Distribution",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "application_stats_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 7: Complaint Summary
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/complaints", summary="Download Complaint Summary PDF")
def report_complaints(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.complaint_report(start_date, end_date)

    headers = ["Complaint Status", "Count"]
    rows = [[d["status"].replace("_", " ").capitalize(), d["count"]] for d in data]

    pdf = generate_table_pdf(
        title="Complaint Summary Report",
        subtitle=_date_subtitle(start_date, end_date),
        headers=headers,
        rows=rows,
    )
    return _pdf_response(pdf, "complaint_summary_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report 8: Top Workers by Rating
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/top-workers", summary="Download Top Workers Report PDF")
def report_top_workers(
    limit: int = Query(20, ge=5, le=100),
    db: Session = Depends(get_db),
):
    svc = ReportService(db)
    data = svc.top_workers_report(limit)

    headers = ["#", "Name", "Skill", "City", "Rating", "Jobs Done", "Daily Rate (₹)"]
    rows = [
        [
            i + 1,
            d["full_name"],
            d["primary_skill"],
            d["city"],
            f"{d['rating_avg']:.1f} ★",
            d["total_jobs_completed"],
            f"₹{d['daily_rate']:,.0f}" if d["daily_rate"] else "N/A",
        ]
        for i, d in enumerate(data)
    ]

    pdf = generate_table_pdf(
        title=f"Top {limit} Workers Report",
        subtitle="Ranked by rating and jobs completed",
        headers=headers,
        rows=rows,
        landscape_mode=True,
    )
    return _pdf_response(pdf, "top_workers_report.pdf")


# ──────────────────────────────────────────────────────────────────────────────
# Report metadata endpoint (used by frontend to list reports)
# ──────────────────────────────────────────────────────────────────────────────
@router.get("/list", summary="List all available reports")
def list_reports(_: User = Depends(require_admin)):
    return [
        {
            "id": "user-registration",
            "title": "User Registration Summary",
            "description": "Breakdown of users by role with verification and active status.",
            "has_date_filter": True,
            "icon": "Users",
        },
        {
            "id": "job-status",
            "title": "Job Status Summary",
            "description": "Count and wage stats grouped by job status.",
            "has_date_filter": True,
            "icon": "Briefcase",
        },
        {
            "id": "job-category",
            "title": "Jobs by Category",
            "description": "All job categories with open, completed counts and average wages.",
            "has_date_filter": True,
            "icon": "LayoutGrid",
        },
        {
            "id": "worker-skills",
            "title": "Worker Skills Distribution",
            "description": "Primary skills breakdown with ratings and rates.",
            "has_date_filter": False,
            "icon": "Wrench",
        },
        {
            "id": "city-activity",
            "title": "City-wise Activity",
            "description": "Top 20 cities by jobs, workers and companies.",
            "has_date_filter": False,
            "icon": "MapPin",
        },
        {
            "id": "application-stats",
            "title": "Application Status Distribution",
            "description": "Job application counts and percentages by status.",
            "has_date_filter": True,
            "icon": "ClipboardList",
        },
        {
            "id": "complaints",
            "title": "Complaint Summary",
            "description": "Complaint counts grouped by resolution status.",
            "has_date_filter": True,
            "icon": "ShieldAlert",
        },
        {
            "id": "top-workers",
            "title": "Top Workers Report",
            "description": "Top workers ranked by rating and completed jobs.",
            "has_date_filter": False,
            "icon": "Star",
            "extra_param": {"name": "limit", "type": "number", "default": 20},
        },
    ]