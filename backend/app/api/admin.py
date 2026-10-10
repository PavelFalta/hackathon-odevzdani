from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import require_admin
from app.db.models import User
from app.services.admin_usage import build_admin_analytics, build_user_usage_summaries
from app.services.admin_usage_range import AdminPeriod

router = APIRouter(prefix="/admin", tags=["admin"])


class UserUsageSummary(BaseModel):
    username: str
    tool_calls: int
    mapbox_calls: int
    openai_events: int
    input_tokens: int
    output_tokens: int
    event_count: int


@router.get("/usage", response_model=list[UserUsageSummary])
def usage_by_user(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[UserUsageSummary]:
    return [UserUsageSummary(**row) for row in build_user_usage_summaries(db)]


@router.get("/analytics")
def admin_analytics(
    period: AdminPeriod = Query("30d"),
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to"),
    username: str | None = None,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    try:
        return build_admin_analytics(
            db,
            period=period,
            from_date=from_date,
            to_date=to_date,
            username=username,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
