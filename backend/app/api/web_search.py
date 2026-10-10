from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.deps import get_current_user_row
from app.services.usage_log import record_usage
from app.services.web_search import WebSearchError, search_live_web

router = APIRouter(prefix="/assistant/web-search", tags=["assistant"])

ONLINE_DISCLOSURE = "Údaje o akcích jsem dohledal online."


class WebSearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=400)
    when: str | None = Field(default=None, max_length=80)


class WebEventOut(BaseModel):
    date: str
    time: str | None = None
    title: str
    place: str | None = None
    url: str | None = None


class WebSearchResponse(BaseModel):
    ok: bool = True
    summary: str
    events: list[WebEventOut]
    data_source: dict


@router.post("", response_model=WebSearchResponse)
def web_search(
    body: WebSearchRequest,
    user=Depends(get_current_user_row),
    db: Session = Depends(get_db),
) -> WebSearchResponse:
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Online vyhledávání není nakonfigurované.",
        )
    try:
        result = search_live_web(body.query, when=body.when, api_key=settings.openai_api_key)
    except WebSearchError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    record_usage(
        db,
        user_id=user.id,
        category="web_search",
        label="search_web",
        quantity=1,
        meta={"query": body.query[:120]},
    )
    db.commit()
    return WebSearchResponse(
        summary=result.summary,
        events=[
            WebEventOut(
                date=event.date,
                time=event.time,
                title=event.title,
                place=event.place,
                url=event.url,
            )
            for event in result.events
        ],
        data_source={"kind": "online", "disclosure_cs": ONLINE_DISCLOSURE},
    )
