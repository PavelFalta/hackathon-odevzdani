from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.deps import get_current_user
from app.services.browser_html_proxy import BrowserHtmlProxyError, fetch_proxy_html
from app.services.embed_frame import check_embeddable
from app.services.embed_frame_fetch import EmbedFetchError

router = APIRouter(prefix="/browser", tags=["browser"])


class EmbedCheckResponse(BaseModel):
    embeddable: bool
    reason: str | None = None


class BrowserHtmlResponse(BaseModel):
    html: str
    final_url: str


def _normalize_target_url(raw: str) -> str:
    candidate = raw.strip()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Chybí URL")
    if not candidate.startswith(("http://", "https://")):
        candidate = f"https://{candidate}"
    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Neplatná URL")
    return candidate


def _normalize_ancestor_origin(raw: str) -> str:
    parsed = urlparse(raw.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Neplatný původ nadřazené stránky",
        )
    port = parsed.port
    host = parsed.hostname
    scheme = parsed.scheme
    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        return f"{scheme}://{host}:{port}"
    return f"{scheme}://{host}"


@router.get("/html", response_model=BrowserHtmlResponse)
def browser_html(
    url: str = Query(..., min_length=1, max_length=2048),
    _user: str = Depends(get_current_user),
) -> BrowserHtmlResponse:
    target = _normalize_target_url(url)
    try:
        html, final_url = fetch_proxy_html(target)
    except EmbedFetchError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    except BrowserHtmlProxyError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc
    return BrowserHtmlResponse(html=html, final_url=final_url)


@router.get("/embed-check", response_model=EmbedCheckResponse)
def embed_check(
    url: str = Query(..., min_length=1, max_length=2048),
    ancestor: str = Query(..., min_length=1, max_length=2048),
    _user: str = Depends(get_current_user),
) -> EmbedCheckResponse:
    target = _normalize_target_url(url)
    ancestor_origin = _normalize_ancestor_origin(ancestor)
    embeddable, reason = check_embeddable(target, ancestor_origin)
    return EmbedCheckResponse(embeddable=embeddable, reason=reason)
