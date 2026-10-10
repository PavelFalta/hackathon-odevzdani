from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import get_current_user_row
from app.services.conversation_store import create_conversation
from app.services.realtime_session import create_realtime_client_secret
from app.services.usage_log import record_usage

router = APIRouter(prefix="/assistant/realtime", tags=["assistant"])

RealtimeSessionMode = Literal["text", "voice"]


class RealtimeClientSecretRequest(BaseModel):
    mode: RealtimeSessionMode = "text"


class RealtimeClientSecretResponse(BaseModel):
    client_secret: str
    expires_at: int
    conversation_id: str


@router.post("/client-secret", response_model=RealtimeClientSecretResponse)
async def realtime_client_secret(
    body: RealtimeClientSecretRequest = RealtimeClientSecretRequest(),
    user=Depends(get_current_user_row),
    db: Session = Depends(get_db),
) -> RealtimeClientSecretResponse:
    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrátor nemá přístup k asistentovi.",
        )
    conversation = create_conversation(db, user, body.mode)
    try:
        secret, expires_at = create_realtime_client_secret(user.username, mode=body.mode)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    record_usage(
        db,
        user_id=user.id,
        conversation_id=conversation.id,
        category="openai_realtime",
        label="session_mint",
        quantity=1,
        meta={"mode": body.mode},
    )
    db.commit()
    return RealtimeClientSecretResponse(
        client_secret=secret,
        expires_at=expires_at,
        conversation_id=str(conversation.id),
    )
