import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.services.google_places_reviews import ReviewsServiceError

_PHOTO_NAME_RE = re.compile(r"^places/[^/]+/photos/.+$")
_MAX_NAME_LEN = 4096
_TIMEOUT_SEC = 20
_MAX_PX = 1600


def assert_valid_photo_name(photo_name: str) -> str:
    trimmed = photo_name.strip()
    if not trimmed or len(trimmed) > _MAX_NAME_LEN:
        raise ReviewsServiceError("Neplatný odkaz na fotografii.")
    if not _PHOTO_NAME_RE.fullmatch(trimmed):
        raise ReviewsServiceError("Neplatný odkaz na fotografii.")
    if ".." in trimmed or trimmed.startswith("/"):
        raise ReviewsServiceError("Neplatný odkaz na fotografii.")
    return trimmed


def _clamp_px(value: int) -> int:
    return max(1, min(value, _MAX_PX))


def fetch_place_photo_media(
    photo_name: str,
    api_key: str,
    *,
    max_height_px: int = 800,
    max_width_px: int = 800,
) -> tuple[bytes, str]:
    if not api_key:
        raise ReviewsServiceError("Služba recenzí není nakonfigurovaná.")
    safe_name = assert_valid_photo_name(photo_name)
    height = _clamp_px(max_height_px)
    width = _clamp_px(max_width_px)
    url = f"https://places.googleapis.com/v1/{safe_name}/media?maxHeightPx={height}&maxWidthPx={width}"
    request = Request(
        url,
        method="GET",
        headers={
            "Accept": "image/*",
            "X-Goog-Api-Key": api_key,
        },
    )
    try:
        with urlopen(request, timeout=_TIMEOUT_SEC) as response:
            body = response.read()
            content_type = response.headers.get("Content-Type", "image/jpeg")
    except HTTPError as exc:
        raise ReviewsServiceError("Google Places odpovědělo chybou.") from exc
    except URLError as exc:
        raise ReviewsServiceError("Nepodařilo se načíst fotografii.") from exc
    if not body:
        raise ReviewsServiceError("Fotografie je prázdná.")
    return body, content_type.split(";", 1)[0].strip() or "image/jpeg"
