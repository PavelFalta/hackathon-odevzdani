import uuid
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.db.models import UsageEvent


def record_usage(
    db: Session,
    *,
    user_id: int,
    category: str,
    label: str,
    quantity: int = 1,
    conversation_id: uuid.UUID | None = None,
    input_tokens: int | None = None,
    output_tokens: int | None = None,
    meta: dict | None = None,
) -> None:
    db.add(
        UsageEvent(
            user_id=user_id,
            conversation_id=conversation_id,
            category=category,
            label=label,
            quantity=quantity,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            meta=meta,
            occurred_at=datetime.now(UTC),
        ),
    )
