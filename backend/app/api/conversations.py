import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.deps import get_current_user_row
from app.services.conversation_store import (
    append_items,
    get_for_user,
    list_for_user,
    record_turn_usage,
)

router = APIRouter(prefix="/assistant/conversations", tags=["assistant"])


class ConversationSummary(BaseModel):
    id: uuid.UUID
    mode: str
    title: str | None
    created_at: str
    updated_at: str


class ConversationItemOut(BaseModel):
    kind: str
    body: str
    tool_name: str | None
    created_at: str


class ConversationDetail(BaseModel):
    id: uuid.UUID
    mode: str
    title: str | None
    created_at: str
    updated_at: str
    items: list[ConversationItemOut]


class TurnItemIn(BaseModel):
    kind: str = Field(..., pattern="^(user_message|assistant_message|tool)$")
    body: str = Field(..., min_length=1, max_length=8000)
    tool_name: str | None = Field(default=None, max_length=64)


class TurnUsageIn(BaseModel):
    category: str = Field(default="openai_realtime", max_length=32)
    label: str = Field(..., max_length=64)
    quantity: int = Field(default=1, ge=1, le=1000)
    input_tokens: int | None = Field(default=None, ge=0)
    output_tokens: int | None = Field(default=None, ge=0)


class AppendTurnBody(BaseModel):
    items: list[TurnItemIn] = Field(default_factory=list, max_length=40)
    usage: list[TurnUsageIn] = Field(default_factory=list, max_length=40)


def _iso(dt) -> str:
    return dt.isoformat()


@router.get("", response_model=list[ConversationSummary])
def list_conversations(
    user: User = Depends(get_current_user_row),
    db: Session = Depends(get_db),
) -> list[ConversationSummary]:
    rows = list_for_user(db, user.id)
    return [
        ConversationSummary(
            id=row.id,
            mode=row.mode,
            title=row.title,
            created_at=_iso(row.created_at),
            updated_at=_iso(row.updated_at),
        )
        for row in rows
    ]


@router.get("/{conversation_id}", response_model=ConversationDetail)
def conversation_detail(
    conversation_id: uuid.UUID,
    user: User = Depends(get_current_user_row),
    db: Session = Depends(get_db),
) -> ConversationDetail:
    row = get_for_user(db, user.id, conversation_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konverzace nenalezena")
    return ConversationDetail(
        id=row.id,
        mode=row.mode,
        title=row.title,
        created_at=_iso(row.created_at),
        updated_at=_iso(row.updated_at),
        items=[
            ConversationItemOut(
                kind=item.kind,
                body=item.body,
                tool_name=item.tool_name,
                created_at=_iso(item.created_at),
            )
            for item in row.items
        ],
    )


@router.post("/{conversation_id}/turns", status_code=status.HTTP_204_NO_CONTENT)
def append_turn(
    conversation_id: uuid.UUID,
    body: AppendTurnBody,
    user: User = Depends(get_current_user_row),
    db: Session = Depends(get_db),
) -> None:
    row = get_for_user(db, user.id, conversation_id)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Konverzace nenalezena")
    payload = []
    for item in body.items:
        entry = {"kind": item.kind, "body": item.body, "tool_name": item.tool_name}
        if item.kind == "user_message":
            entry["title_body"] = item.body
        payload.append(entry)
    append_items(db, row, payload)
    usage_rows = [u.model_dump() for u in body.usage]
    tool_usage = sum(1 for row in usage_rows if row.get("category") == "tool")
    tool_items = [item for item in body.items if item.kind == "tool"]
    for item in tool_items[tool_usage:]:
        label = (item.tool_name or "tool_call").strip() or "tool_call"
        usage_rows.append({"category": "tool", "label": label, "quantity": 1})
    record_turn_usage(db, user, row, usage_rows)
