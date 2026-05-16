from fastapi import APIRouter, Depends, File, UploadFile
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.upload_service import UploadService


router = APIRouter(prefix="/uploads", tags=["Uploads"])
service = UploadService()


@router.post("/image", summary="Upload an image (profile picture, etc.)")
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
) -> dict:
    relative_path, url_path = await service.save_image(file)
    return {
        "filename": relative_path,
        "url": url_path,
        "size_bytes": file.size,
    }


@router.post("/document", summary="Upload a document (PDF, image)")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
) -> dict:
    relative_path, url_path = await service.save_document(file)
    return {
        "filename": relative_path,
        "url": url_path,
        "size_bytes": file.size,
    }
