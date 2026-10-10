from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class PhotoAttribution:
    display_name: str
    uri: str | None


@dataclass(frozen=True)
class PlacePhotoItem:
    name: str
    attributions: list[PhotoAttribution]


def _attribution_name(entry: dict[str, Any]) -> str:
    display = entry.get("displayName")
    if isinstance(display, str):
        return display.strip()
    if isinstance(display, dict):
        return str(display.get("text", "")).strip()
    return ""


def _parse_photo_attributions(raw: dict[str, Any]) -> list[PhotoAttribution]:
    authors: list[PhotoAttribution] = []
    for entry in raw.get("authorAttributions") or []:
        if not isinstance(entry, dict):
            continue
        display = _attribution_name(entry)
        if not display:
            continue
        uri = entry.get("uri")
        authors.append(
            PhotoAttribution(
                display_name=display,
                uri=uri if isinstance(uri, str) and uri else None,
            ),
        )
    return authors


def parse_place_photos(raw: dict[str, Any]) -> list[PlacePhotoItem]:
    photos: list[PlacePhotoItem] = []
    for entry in raw.get("photos") or []:
        if not isinstance(entry, dict):
            continue
        name = entry.get("name")
        if not isinstance(name, str) or not name.strip():
            continue
        photos.append(
            PlacePhotoItem(
                name=name.strip(),
                attributions=_parse_photo_attributions(entry),
            ),
        )
    return photos
