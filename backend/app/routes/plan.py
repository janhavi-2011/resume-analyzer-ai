# app/routes/plan.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.config.database import get_db
from app.utils.rate_limit import get_usage_info, TIER_CONFIG
from app.schemas.analysis import PlanResponse, PlanUpgradeResponse

router = APIRouter(prefix="/plan", tags=["Plan"])


@router.get("/", response_model=PlanResponse)
def get_plan(current_user: User = Depends(get_current_user)):
    """Get current plan info and usage."""
    usage = get_usage_info(current_user)
    return PlanResponse(
        plan=usage["plan"],
        plan_label=usage["plan_label"],
        used=usage["used"],
        limit=usage["limit"],
        remaining=usage["remaining"],
    )


@router.post("/upgrade", response_model=PlanUpgradeResponse)
def upgrade_to_pro(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upgrade user to Pro tier.
    In production, this would integrate with Stripe.
    For now, it's a free simulation.
    """
    if current_user.plan == "pro":
        return PlanUpgradeResponse(
            message="You are already on the Pro plan",
            plan="pro",
        )

    current_user.plan = "pro"
    current_user.ai_calls_count = 0
    from datetime import datetime, timezone
    current_user.ai_calls_reset_at = datetime.now(timezone.utc)
    db.commit()

    return PlanUpgradeResponse(
        message="Successfully upgraded to Pro! You now have 30 analyses per day.",
        plan="pro",
    )


@router.post("/downgrade", response_model=PlanUpgradeResponse)
def downgrade_to_free(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Downgrade user to Free tier."""
    current_user.plan = "free"
    current_user.ai_calls_count = 0
    from datetime import datetime, timezone
    current_user.ai_calls_reset_at = datetime.now(timezone.utc)
    db.commit()

    config = TIER_CONFIG["free"]
    return PlanUpgradeResponse(
        message=f"Downgraded to Free plan. You have {config['max_calls']} analyses per month.",
        plan="free",
    )