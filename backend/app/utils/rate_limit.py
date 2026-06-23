# app/utils/rate_limit.py

from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User

# ─────────────────────────────────────────────────────
# TIER DEFINITIONS
# ─────────────────────────────────────────────────────

TIER_CONFIG = {
    "free": {
        "max_calls": 5,           # 5 per month
        "reset_window_seconds": 30 * 24 * 3600,  # 30 days
        "label": "3 analyses/month",
    },
    "pro": {
        "max_calls": 30,          # 30 per day
        "reset_window_seconds": 24 * 3600,        # 24 hours
        "label": "30 analyses/day",
    },
}


def check_and_increment_rate_limit(user: User, db: Session) -> int:
    """
    Check if user has remaining AI calls. Increment count.
    Returns remaining calls after this one.
    Raises 429 if limit exceeded.
    """
    plan = user.plan or "free"
    config = TIER_CONFIG[plan]
    max_calls = config["max_calls"]
    reset_window = config["reset_window_seconds"]

    now = datetime.now(timezone.utc)
    reset_at = user.ai_calls_reset_at

    # Make reset_at timezone-aware if it isn't
    if reset_at and reset_at.tzinfo is None:
        reset_at = reset_at.replace(tzinfo=timezone.utc)

    # Reset counter if window has passed
    if not reset_at or (now - reset_at).total_seconds() > reset_window:
        user.ai_calls_count = 0
        user.ai_calls_reset_at = now

    # Check limit
    if user.ai_calls_count >= max_calls:
        elapsed = (now - user.ai_calls_reset_at).total_seconds()
        remaining_seconds = reset_window - elapsed

        if remaining_seconds > 86400:
            time_str = f"{int(remaining_seconds // 86400)} days"
        elif remaining_seconds > 3600:
            time_str = f"{int(remaining_seconds // 3600)}h {int((remaining_seconds % 3600) // 60)}m"
        else:
            time_str = f"{int(remaining_seconds // 60)} minutes"

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"{'Free' if plan == 'free' else 'Pro'} plan limit reached ({max_calls}/{'month' if plan == 'free' else 'day'}). Resets in {time_str}. Upgrade at /dashboard/analytics",
        )

    # Increment
    user.ai_calls_count += 1
    db.commit()
    db.refresh(user)

    remaining = max_calls - user.ai_calls_count
    return remaining


def get_usage_info(user: User) -> dict:
    """Get current usage info for a user."""
    plan = user.plan or "free"
    config = TIER_CONFIG[plan]
    max_calls = config["max_calls"]
    reset_window = config["reset_window_seconds"]

    now = datetime.now(timezone.utc)
    reset_at = user.ai_calls_reset_at

    if reset_at and reset_at.tzinfo is None:
        reset_at = reset_at.replace(tzinfo=timezone.utc)

    # Reset if window passed
    if not reset_at or (now - reset_at).total_seconds() > reset_window:
        return {
            "used": 0,
            "limit": max_calls,
            "remaining": max_calls,
            "plan": plan,
            "plan_label": config["label"],
        }

    used = user.ai_calls_count
    return {
        "used": used,
        "limit": max_calls,
        "remaining": max(0, max_calls - used),
        "plan": plan,
        "plan_label": config["label"],
    }