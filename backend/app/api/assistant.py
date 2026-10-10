from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.deps import get_current_user
from app.services.assistant_chat import answer_with_knowledge

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., min_length=1, max_length=50)
    map_context: dict | None = None


class ChatResponse(BaseModel):
    message: str
    sources: list[dict] = Field(default_factory=list)
    context: str | None = Field(
        default=None,
        description="Retrieved passages formatted for LLM RAG (wire to chat model next).",
    )


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    _user: str = Depends(get_current_user),
) -> ChatResponse:
    last = body.messages[-1].content
    message, sources, context = answer_with_knowledge(last, map_context=body.map_context)
    return ChatResponse(message=message, sources=sources, context=context)
