# app/routes/resume.py

import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.config.mongodb import resumes_collection
from app.utils.pdf_parser import extract_text_from_pdf
from app.utils.cloudinary_upload import upload_pdf, delete_pdf
from app.schemas.resume import (
    ResumeUploadResponse,
    ResumeDetailResponse,
    ResumeListItem,
    ResumeListResponse,
    ResumeDeleteResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_TYPES = ["application/pdf"]


# ---------- UPLOAD RESUME ----------

@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed",
        )

    # Read file bytes
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be under 5MB",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file uploaded",
        )

    # Extract text from PDF
    parsed = extract_text_from_pdf(file_bytes)

    if not parsed["is_parseable"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract text from PDF. It may be image-based. Please upload a text-based PDF.",
        )

    # Upload to Cloudinary
    try:
        upload_result = upload_pdf(
            file_bytes=file_bytes,
            filename=file.filename or "resume.pdf",
            user_id=str(current_user.id),
        )
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="File storage failed. Please try again.",
        )

    # Save to MongoDB
    resume_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    resume_doc = {
        "_id": resume_id,
        "user_id": str(current_user.id),
        "user_email": current_user.email,
        "filename": file.filename or "resume.pdf",
        "file_url": upload_result["url"],
        "cloudinary_public_id": upload_result["public_id"],
        "file_size_bytes": len(file_bytes),
        "page_count": parsed["page_count"],
        "total_words": parsed["total_words"],
        "total_characters": parsed["total_characters"],
        "is_parseable": parsed["is_parseable"],
        "full_text": parsed["full_text"],
        "pages": parsed["pages"],
        "created_at": now,
        "updated_at": now,
    }

    resumes_collection.insert_one(resume_doc)

    # Prepare preview (first 1000 characters)
    preview = parsed["full_text"][:1000]
    if len(parsed["full_text"]) > 1000:
        preview += "..."

    return ResumeUploadResponse(
        id=resume_id,
        filename=file.filename or "resume.pdf",
        file_url=upload_result["url"],
        page_count=parsed["page_count"],
        total_words=parsed["total_words"],
        total_characters=parsed["total_characters"],
        is_parseable=parsed["is_parseable"],
        extracted_text_preview=preview,
        created_at=now,
    )


# ---------- LIST RESUMES ----------

@router.get("/", response_model=ResumeListResponse)
def list_resumes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
):
    skip = (page - 1) * limit
    query = {"user_id": str(current_user.id)}

    total = resumes_collection.count_documents(query)

    cursor = resumes_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)

    resumes = []
    for doc in cursor:
        resumes.append(ResumeListItem(
            id=doc["_id"],
            filename=doc["filename"],
            page_count=doc["page_count"],
            total_words=doc["total_words"],
            is_parseable=doc["is_parseable"],
            created_at=doc["created_at"],
        ))

    return ResumeListResponse(resumes=resumes, total=total)


# ---------- GET SINGLE RESUME ----------

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
):
    doc = resumes_collection.find_one({"_id": resume_id, "user_id": str(current_user.id)})

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return ResumeDetailResponse(
        id=doc["_id"],
        user_id=doc["user_id"],
        filename=doc["filename"],
        file_url=doc["file_url"],
        page_count=doc["page_count"],
        total_words=doc["total_words"],
        total_characters=doc["total_characters"],
        is_parseable=doc["is_parseable"],
        full_text=doc["full_text"],
        pages=doc["pages"],
        created_at=doc["created_at"],
    )


# ---------- DELETE RESUME ----------

@router.delete("/{resume_id}", response_model=ResumeDeleteResponse)
def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
):
    doc = resumes_collection.find_one({"_id": resume_id, "user_id": str(current_user.id)})

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    # Delete from Cloudinary
    if doc.get("cloudinary_public_id"):
        delete_pdf(doc["cloudinary_public_id"])

    # Delete from MongoDB
    resumes_collection.delete_one({"_id": resume_id})

    return ResumeDeleteResponse(message="Resume deleted successfully")