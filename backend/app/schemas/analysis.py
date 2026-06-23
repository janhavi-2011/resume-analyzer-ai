# app/schemas/analysis.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AnalysisRequest(BaseModel):
    job_description: Optional[str] = None


class UsageResponse(BaseModel):
    used: int
    limit: int
    remaining: int


class AnalysisListItem(BaseModel):
    id: str
    resume_id: str
    score: Optional[int]
    has_jd: bool
    model_used: str
    created_at: datetime


class AnalysisListResponse(BaseModel):
    analyses: list[AnalysisListItem]
    total: int


class AnalysisDetailResponse(BaseModel):
    id: str
    resume_id: str
    score: Optional[int]
    full_text: str
    sections: dict
    job_description: Optional[str]
    model_used: str
    created_at: datetime


# ───────── NEW SCHEMAS ─────────

class HistoryItem(BaseModel):
    id: str
    resume_id: str
    resume_filename: str
    score: Optional[int]
    has_jd: bool
    model_used: str
    created_at: datetime


class HistoryResponse(BaseModel):
    analyses: list[HistoryItem]
    total: int


class TrendPoint(BaseModel):
    date: str
    score: int
    resume_filename: str
    analysis_id: str


class TrendResponse(BaseModel):
    trends: list[TrendPoint]


class KeywordData(BaseModel):
    matched: list[str]
    missing: list[str]
    match_percentage: Optional[int]
    raw_text: str


class KeywordGapResponse(BaseModel):
    analysis_id: str
    resume_id: str
    has_jd: bool
    keywords: Optional[KeywordData]

class PlanResponse(BaseModel):
    plan: str
    plan_label: str
    used: int
    limit: int
    remaining: int


class PlanUpgradeResponse(BaseModel):
    message: str
    plan: str