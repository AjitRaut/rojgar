import os
import uuid
from datetime import datetime
from typing import Tuple


def generate_unique_filename(original: str) -> str:
    ext = os.path.splitext(original)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


def paginate_params(page: int, page_size: int) -> Tuple[int, int]:
    page = max(1, page)
    page_size = max(1, min(100, page_size))
    skip = (page - 1) * page_size
    return skip, page_size


def calculate_total_pages(total: int, page_size: int) -> int:
    if page_size <= 0:
        return 0
    return (total + page_size - 1) // page_size


def utc_now() -> datetime:
    from datetime import timezone
    return datetime.now(timezone.utc)
