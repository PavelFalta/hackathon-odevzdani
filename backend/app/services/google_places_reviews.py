import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.services.google_places_photos import PlacePhotoItem, parse_place_photos

_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"
_FIELD_MASK = "places.displayName,places.rating,places.userRatingCount,places.reviews,places.photos"
_TIMEOUT_SEC = 15


class ReviewsServiceError(Exception):
    pass


@dataclass(frozen=True)
class ReviewItem:
    author: str
    rating: float | None
    text: str
    published_at: str | None


@dataclass(frozen=True)
class PlaceReviewsResult:
    place_name: str
    rating: float | None
    rating_count: int | None
    reviews: list[ReviewItem]
    photos: list[PlacePhotoItem]


def _text_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return str(value.get("text", ""))
    return str(value)


def _parse_place(raw: dict[str, Any]) -> PlaceReviewsResult:
    items: list[ReviewItem] = []
    for entry in raw.get("reviews") or []:
        attribution = entry.get("authorAttribution") or {}
        author = _text_value(attribution.get("displayName"))
        original = _text_value(entry.get("originalText"))
        localized = _text_value(entry.get("text"))
        items.append(
            ReviewItem(
                author=author or "Anonym",
                rating=entry.get("rating"),
                text=localized or original,
                published_at=entry.get("publishTime")
                or entry.get("relativePublishTimeDescription"),
            ),
        )
    return PlaceReviewsResult(
        place_name=_text_value(raw.get("displayName")),
        rating=raw.get("rating"),
        rating_count=raw.get("userRatingCount"),
        reviews=items,
        photos=parse_place_photos(raw),
    )


def search_place_reviews(query: str, api_key: str) -> PlaceReviewsResult:
    trimmed = query.strip()
    if not trimmed:
        raise ReviewsServiceError("Zadej název místa nebo adresu.")
    if not api_key:
        raise ReviewsServiceError("Služba recenzí není nakonfigurovaná.")

    body = json.dumps(
        {
            "textQuery": trimmed,
            "languageCode": "cs",
            "regionCode": "CZ",
        },
    ).encode("utf-8")
    request = Request(
        _PLACES_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Accept-Language": "cs-CZ,cs;q=0.9",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": _FIELD_MASK,
        },
    )
    try:
        with urlopen(request, timeout=_TIMEOUT_SEC) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        raise ReviewsServiceError("Google Places odpovědělo chybou.") from exc
    except URLError as exc:
        raise ReviewsServiceError("Nepodařilo se kontaktovat Google Places.") from exc

    places = payload.get("places") or []
    if not places:
        raise ReviewsServiceError("Místo nenalezeno.")
    return _parse_place(places[0])
