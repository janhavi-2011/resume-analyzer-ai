# app/utils/cloudinary_upload.py

import io
import os
import cloudinary
import cloudinary.uploader
from app.config.settings import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_pdf(file_bytes: bytes, filename: str, user_id: str) -> dict:
    """
    Upload a PDF file to Cloudinary.
    Returns upload result with URL and public_id.
    """

    # Remove extension (.pdf)
    name, ext = os.path.splitext(filename)

    result = cloudinary.uploader.upload(
        io.BytesIO(file_bytes),
        resource_type="raw",
        folder=f"{settings.CLOUDINARY_FOLDER}/{user_id}",
        public_id=f"{name}_{user_id[:8]}",
        use_filename=False,
        unique_filename=False,
        overwrite=True,
    )

    return {
        "url": result["secure_url"],      # Use Cloudinary URL directly
        "public_id": result["public_id"],
        "bytes": result.get("bytes"),
        "format": result.get("format"),
        "created_at": result.get("created_at"),
    }


def delete_pdf(public_id: str) -> bool:
    """Delete PDF from Cloudinary"""
    try:
        cloudinary.uploader.destroy(
            public_id,
            resource_type="raw"
        )
        return True
    except Exception:
        return False