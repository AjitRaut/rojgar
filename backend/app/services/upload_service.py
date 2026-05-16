import os
from typing import Tuple
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import BadRequestError
from app.utils.helpers import generate_unique_filename


ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_DOC_EXTS = {".pdf", ".jpg", ".jpeg", ".png"}


class UploadService:
    def __init__(self):
        self.base_dir = settings.UPLOAD_DIR
        os.makedirs(self.base_dir, exist_ok=True)
        os.makedirs(os.path.join(self.base_dir, "images"), exist_ok=True)
        os.makedirs(os.path.join(self.base_dir, "docs"), exist_ok=True)

    async def save_image(self, file: UploadFile) -> Tuple[str, str]:
        return await self._save(file, "images", ALLOWED_IMAGE_EXTS)

    async def save_document(self, file: UploadFile) -> Tuple[str, str]:
        return await self._save(file, "docs", ALLOWED_DOC_EXTS)

    async def _save(
        self,
        file: UploadFile,
        subfolder: str,
        allowed_exts: set,
    ) -> Tuple[str, str]:
        if not file.filename:
            raise BadRequestError("No filename provided")

        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_exts:
            raise BadRequestError(
                f"File type {ext} not allowed. Allowed: {', '.join(sorted(allowed_exts))}"
            )

        content = await file.read()
        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_size:
            raise BadRequestError(
                f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit"
            )

        new_name = generate_unique_filename(file.filename)
        relative_path = f"{subfolder}/{new_name}"
        full_path = os.path.join(self.base_dir, subfolder, new_name)

        with open(full_path, "wb") as f:
            f.write(content)

        url_path = f"/uploads/{relative_path}"
        return relative_path, url_path
