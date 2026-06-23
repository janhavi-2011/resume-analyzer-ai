# app/schemas/resume.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class ResumeUploadResponse(BaseModel):
    id: str
    filename: str
    file_url: str
    page_count: int
    total_words: int
    total_characters: int
    is_parseable: bool
    extracted_text_preview: str  # First 1000 chars
    created_at: datetime


class ResumeDetailResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_url: str
    page_count: int
    total_words: int
    total_characters: int
    is_parseable: bool
    full_text: str
    pages: list[dict]
    created_at: datetime


class ResumeListItem(BaseModel):
    id: str
    filename: str
    page_count: int
    total_words: int
    is_parseable: bool
    created_at: datetime


class ResumeListResponse(BaseModel):
    resumes: list[ResumeListItem]
    total: int


class ResumeDeleteResponse(BaseModel):
    message: str