import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.db.models import Conversation, ConversationItem, User
from app.services.usage_log import record_usage


def create_conversation(db: Session, user: User, mode: str) -> Conversation:
    row = Conversation(user_id=user.id, mode=mode)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def next_item_position(db: Session, conversation_id: uuid.UUID) -> int:
    current = db.scalar(
        select(func.max(ConversationItem.position)).where(
            ConversationItem.conversation_id == conversation_id,
        ),
    )
    return (current or 0) + 1


def append_items(
    db: Session,
    conversation: Conversation,
    items: list[dict],
) -> None:
    if not items:
        return
    position = next_item_position(db, conversation.id)
    now = datetime.now(UTC)
    for offset, item in enumerate(items):
        db.add(
            ConversationItem(
                conversation_id=conversation.id,
                position=position + offset,
                kind=item["kind"],
                body=item["body"],
                tool_name=item.get("tool_name"),
                created_at=now,
            ),
        )
        title_body = item.get("title_body")
        if title_body and not conversation.title:
            conversation.title = title_body[:200]
    conversation.updated_at = now
    db.commit()


def record_turn_usage(
    db: Session,
    user: User,
    conversation: Conversation,
    usage_rows: list[dict],
) -> None:
    for row in usage_rows:
        record_usage(
            db,
            user_id=user.id,
            conversation_id=conversation.id,
            category=row.get("category", "openai_realtime"),
            label=row["label"],
            quantity=row.get("quantity", 1),
            input_tokens=row.get("input_tokens"),
            output_tokens=row.get("output_tokens"),
            meta=row.get("meta"),
        )
    db.commit()


def list_for_user(db: Session, user_id: int) -> list[Conversation]:
    return list(
        db.scalars(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc()),
        ).all(),
    )


def get_for_user(db: Session, user_id: int, conversation_id: uuid.UUID) -> Conversation | None:
    return db.scalar(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .options(selectinload(Conversation.items)),
    )
