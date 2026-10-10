from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import UsageEvent, User
from app.services.admin_usage_metrics import (
    category_breakdown,
    daily_series,
    metrics_from_events,
    metrics_to_dict,
    top_tool_labels,
)
from app.services.admin_usage_range import AdminPeriod, resolve_usage_range


def _load_events(
    db: Session,
    *,
    start: datetime,
    end: datetime,
    user_id: int | None,
) -> list[UsageEvent]:
    query = select(UsageEvent).where(
        UsageEvent.occurred_at >= start,
        UsageEvent.occurred_at <= end,
    )
    if user_id is not None:
        query = query.where(UsageEvent.user_id == user_id)
    return list(db.scalars(query).all())


def _non_admin_users(db: Session) -> list[User]:
    return list(
        db.scalars(select(User).where(User.role != "admin").order_by(User.username)).all(),
    )


def build_admin_analytics(
    db: Session,
    *,
    period: AdminPeriod,
    from_date,
    to_date,
    username: str | None,
) -> dict[str, object]:
    start, end = resolve_usage_range(period=period, from_date=from_date, to_date=to_date)
    users = _non_admin_users(db)
    usernames = [user.username for user in users]
    user_id: int | None = None
    if username:
        match = next((user for user in users if user.username == username), None)
        if match is None:
            raise LookupError(f"unknown user: {username}")
        user_id = match.id

    events = _load_events(db, start=start, end=end, user_id=user_id)
    totals = metrics_from_events(events)

    by_user: list[dict[str, object]] = []
    for user in users:
        user_events = [row for row in events if row.user_id == user.id]
        metrics = metrics_from_events(user_events)
        by_user.append({"username": user.username, **metrics_to_dict(metrics)})

    return {
        "period": period,
        "from": start.isoformat(),
        "to": end.isoformat(),
        "username_filter": username,
        "usernames": usernames,
        "totals": metrics_to_dict(totals),
        "by_user": by_user,
        "daily": daily_series(events, start, end),
        "by_category": category_breakdown(events),
        "top_tools": top_tool_labels(events),
    }


def build_user_usage_summaries(db: Session) -> list[dict[str, object]]:
    users = _non_admin_users(db)
    summaries: list[dict[str, object]] = []
    for user in users:
        rows = list(db.scalars(select(UsageEvent).where(UsageEvent.user_id == user.id)).all())
        metrics = metrics_from_events(rows)
        summaries.append({"username": user.username, **metrics_to_dict(metrics)})
    return summaries
