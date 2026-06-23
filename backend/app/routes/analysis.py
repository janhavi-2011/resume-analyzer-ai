# app/routes/analysis.py

import uuid
import json
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import google.generativeai as genai                      # CHANGED
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.config.database import get_db
from app.config.mongodb import resumes_collection, analyses_collection
from app.config.settings import settings
from app.utils.prompts import build_analysis_prompt       # CHANGED import
from app.utils.rate_limit import check_and_increment_rate_limit, get_usage_info
from app.utils.analysis_parser import parse_score_from_text, parse_sections
from app.utils.analysis_parser import parse_score_from_text, parse_sections, parse_keyword_gap
from app.schemas.analysis import (
    AnalysisRequest,
    UsageResponse,
    AnalysisListItem,
    AnalysisListResponse,
    AnalysisDetailResponse,

    HistoryItem,
    HistoryResponse,

    TrendPoint,
    TrendResponse,

    KeywordData,
    KeywordGapResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["AI Analysis"])

# ─────────────────────────────────────────────────────
# CONFIGURE GEMINI (replaces OpenAI client)
# ─────────────────────────────────────────────────────
genai.configure(api_key=settings.GEMINI_API_KEY)

GEMINI_MODEL = "gemini-2.5-flash"    # Free tier model


# ─────────────────────────────────────────────────────
# STREAMING GENERATOR (completely rewritten)
# ─────────────────────────────────────────────────────

async def generate_analysis_stream(
    resume_text: str,
    job_description: str | None,
    user_id: str,
    resume_id: str,
    remaining: int,
):
    """
    Async generator that streams Gemini response as SSE events.
    
    KEY DIFFERENCES FROM OPENAI:
    1. Uses genai.GenerativeModel instead of AsyncOpenAI
    2. Uses generate_content_async(stream=True) instead of chat.completions.create
    3. Iterates with async for over response chunks
    4. Accesses text via chunk.text instead of chunk.choices[0].delta.content
    5. Uses GenerationConfig instead of temperature/max_tokens params
    """

    prompt = build_analysis_prompt(resume_text, job_description)

    try:
        # Send initial event
        yield f"data: {json.dumps({'type': 'start', 'message': 'Analysis started...'})}\n\n"

        # ── CREATE GEMINI MODEL ──
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2500,
            ),
        )

        # ── START STREAMING ──
        response = await model.generate_content_async(
            prompt,
            stream=True,
        )

        full_text = ""

        # ── ITERATE OVER STREAM CHUNKS ──
        async for chunk in response:
            # Gemini chunks: access text directly via chunk.text
            # Some chunks may have no text (safety filters, etc.)
            if chunk.text:
                full_text += chunk.text
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk.text})}\n\n"

        # ── PARSE RESULTS ──
        score = parse_score_from_text(full_text)
        sections = parse_sections(full_text)
        keyword_data = parse_keyword_gap(sections)       # NEW

        # ── SAVE TO MONGODB ──
        analysis_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        analyses_collection.insert_one({
            "_id": analysis_id,
            "resume_id": resume_id,
            "user_id": user_id,
            "job_description": job_description,
            "score": score,
            "full_text": full_text,
            "sections": sections,
            "keyword_data": keyword_data,               # NEW
            "model_used": GEMINI_MODEL,
            "created_at": now,
        })

        # ── SEND SCORE EVENT ──
        if score is not None:
            yield f"data: {json.dumps({'type': 'score', 'score': score})}\n\n"

        # ── SEND COMPLETE EVENT ──
        yield f"data: {json.dumps({'type': 'complete', 'analysis_id': analysis_id, 'sections': sections, 'remaining': remaining})}\n\n"

        yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Analysis streaming error: {str(e)}")

        # Handle Gemini-specific errors with user-friendly messages
        error_message = str(e)

        if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:
            error_message = "Gemini rate limit reached. Please wait a minute and try again."
        elif "API_KEY" in error_message or "PERMISSION_DENIED" in error_message:
            error_message = "API configuration error. Please contact support."
        elif "SAFETY" in error_message or "blocked" in error_message.lower():
            error_message = "Content was blocked by safety filters. Try a different resume."
        else:
            error_message = f"Analysis failed: {error_message}"

        yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"


# ─────────────────────────────────────────────────────
# ENDPOINTS (unchanged — same as before)
# ─────────────────────────────────────────────────────

@router.post("/analyze/{resume_id}")
async def analyze_resume(
    resume_id: str,
    payload: AnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check rate limit
    remaining = check_and_increment_rate_limit(current_user, db)

    # Get resume from MongoDB
    resume_doc = resumes_collection.find_one(
        {"_id": resume_id, "user_id": str(current_user.id)}
    )

    if not resume_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    if not resume_doc.get("is_parseable"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is not parseable. Please upload a text-based PDF.",
        )

    return StreamingResponse(
        generate_analysis_stream(
            resume_text=resume_doc["full_text"],
            job_description=payload.job_description,
            user_id=str(current_user.id),
            resume_id=resume_id,
            remaining=remaining,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/usage", response_model=UsageResponse)
def get_usage(current_user: User = Depends(get_current_user)):
    return UsageResponse(**get_usage_info(current_user))


@router.get("/resume/{resume_id}", response_model=AnalysisListResponse)
def list_analyses(
    resume_id: str,
    current_user: User = Depends(get_current_user),
):
    resume = resumes_collection.find_one(
        {"_id": resume_id, "user_id": str(current_user.id)}
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    cursor = analyses_collection.find(
        {"resume_id": resume_id, "user_id": str(current_user.id)}
    ).sort("created_at", -1)

    analyses = []
    for doc in cursor:
        analyses.append(AnalysisListItem(
            id=doc["_id"],
            resume_id=doc["resume_id"],
            score=doc.get("score"),
            has_jd=bool(doc.get("job_description")),
            model_used=doc.get("model_used", GEMINI_MODEL),
            created_at=doc["created_at"],
        ))

    return AnalysisListResponse(analyses=analyses, total=len(analyses))




# ─────────────────────────────────────────────────────
# HISTORY (all analyses across all resumes)
# ─────────────────────────────────────────────────────

@router.get("/history", response_model=HistoryResponse)
def get_history(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
):
    """
    Get all analyses for the current user across all resumes.
    Includes resume filename for context.
    """
    skip = (page - 1) * limit
    query = {"user_id": str(current_user.id)}

    total = analyses_collection.count_documents(query)

    cursor = analyses_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)

    analyses = []
    for doc in cursor:
        # Get resume filename
        resume_doc = resumes_collection.find_one({"_id": doc["resume_id"]})
        filename = resume_doc["filename"] if resume_doc else "Unknown Resume"

        analyses.append(HistoryItem(
            id=doc["_id"],
            resume_id=doc["resume_id"],
            resume_filename=filename,
            score=doc.get("score"),
            has_jd=bool(doc.get("job_description")),
            model_used=doc.get("model_used", "gemini-1.5-flash"),
            created_at=doc["created_at"],
        ))

    return HistoryResponse(analyses=analyses, total=total)


# ─────────────────────────────────────────────────────
# SCORE TRENDS
# ─────────────────────────────────────────────────────

@router.get("/trends", response_model=TrendResponse)
def get_trends(current_user: User = Depends(get_current_user)):
    """
    Get score trend data for charting.
    Returns all analyses with scores, ordered by date.
    """
    query = {
        "user_id": str(current_user.id),
        "score": {"$ne": None},
    }

    cursor = analyses_collection.find(query).sort("created_at", 1)

    trends = []
    for doc in cursor:
        resume_doc = resumes_collection.find_one({"_id": doc["resume_id"]})
        filename = resume_doc["filename"] if resume_doc else "Resume"

        trends.append(TrendPoint(
            date=doc["created_at"].strftime("%Y-%m-%d %H:%M"),
            score=doc["score"],
            resume_filename=filename,
            analysis_id=doc["_id"],
        ))

    return TrendResponse(trends=trends)


# ─────────────────────────────────────────────────────
# KEYWORD GAP ANALYSIS
# ─────────────────────────────────────────────────────

@router.get("/keywords/{analysis_id}", response_model=KeywordGapResponse)
def get_keyword_gap(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get structured keyword gap data for an analysis.
    Only available for analyses that included a job description.
    """
    doc = analyses_collection.find_one(
        {"_id": analysis_id, "user_id": str(current_user.id)}
    )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    keyword_data = doc.get("keyword_data")

    # If no stored keyword_data, try parsing from sections
    if not keyword_data and doc.get("sections"):
        keyword_data = parse_keyword_gap(doc["sections"])

    has_jd = bool(doc.get("job_description"))

    return KeywordGapResponse(
        analysis_id=doc["_id"],
        resume_id=doc["resume_id"],
        has_jd=has_jd,
        keywords=KeywordData(**keyword_data) if keyword_data else None,
    )

@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
):
    doc = analyses_collection.find_one(
        {"_id": analysis_id, "user_id": str(current_user.id)}
    )

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    return AnalysisDetailResponse(
        id=doc["_id"],
        resume_id=doc["resume_id"],
        score=doc.get("score"),
        full_text=doc["full_text"],
        sections=doc.get("sections", {}),
        job_description=doc.get("job_description"),
        model_used=doc.get("model_used", GEMINI_MODEL),
        created_at=doc["created_at"],
    )


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
):
    result = analyses_collection.delete_one(
        {"_id": analysis_id, "user_id": str(current_user.id)}
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    return {"message": "Analysis deleted successfully"}