from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from starlette import status

from app.db.models import UsageEvent, User
from app.db.session import SessionLocal


def _add_event(
    db,
    user: User,
    *,
    category: str,
    label: str,
    occurred_at: datetime,
    quantity: int = 1,
    input_tokens: int | None = None,
) -> None:
    db.add(
        UsageEvent(
            user_id=user.id,
            category=category,
            label=label,
            quantity=quantity,
            input_tokens=input_tokens,
            occurred_at=occurred_at,
        ),
    )


def test_admin_analytics_requires_admin(client) -> None:
    login = client.post("/api/auth/login", json={"username": "demo", "password": "demo123"})
    token = login.json()["access_token"]
    response = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_analytics_daily_and_filters(client) -> None:
    admin = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = admin.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    with SessionLocal() as db:
        demo = db.scalar(select(User).where(User.username == "demo"))
        assert demo is not None
        old = datetime.now(UTC) - timedelta(days=10)
        recent = datetime.now(UTC) - timedelta(days=1)
        _add_event(db, demo, category="tool", label="map_search", occurred_at=old)
        _add_event(db, demo, category="mapbox", label="directions", occurred_at=recent)
        _add_event(
            db,
            demo,
            category="openai_realtime",
            label="turn",
            occurred_at=recent,
            quantity=2,
            input_tokens=50,
        )
        db.commit()

    response = client.get("/api/admin/analytics?period=7d", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["totals"]["mapbox_calls"] == 1
    assert body["totals"]["tool_calls"] == 0
    assert body["totals"]["openai_events"] == 2
    assert len(body["daily"]) == 7
    assert any(row["category"] == "mapbox" for row in body["by_category"])

    user_only = client.get("/api/admin/analytics?period=7d&username=demo", headers=headers)
    assert user_only.status_code == status.HTTP_200_OK
    assert user_only.json()["totals"]["mapbox_calls"] == 1

    missing = client.get("/api/admin/analytics?period=7d&username=nobody", headers=headers)
    assert missing.status_code == status.HTTP_404_NOT_FOUND
