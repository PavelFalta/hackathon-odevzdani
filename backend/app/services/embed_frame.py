from app.services.embed_frame_fetch import EmbedFetchError, fetch_framing_headers
from app.services.embed_frame_policy import embed_blocked_reason


def check_embeddable(url: str, ancestor_origin: str) -> tuple[bool, str | None]:
    try:
        final_url, headers = fetch_framing_headers(url)
    except EmbedFetchError as exc:
        return False, str(exc)
    reason = embed_blocked_reason(headers, ancestor_origin=ancestor_origin, final_url=final_url)
    if reason:
        return False, reason
    return True, None
