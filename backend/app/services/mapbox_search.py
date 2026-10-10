import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.config import settings
from app.geo.kvk import CHEB_LAT, CHEB_LON, kvk_bbox_param
from app.services.mapbox_search_parse import MapboxPlaceHit, hits_from_collection

_SEARCH_BOX_BASE = "https://api.mapbox.com/search/searchbox/v1"
_TIMEOUT_SEC = 15


class MapboxSearchError(Exception):
    pass


def mapbox_configured() -> bool:
    return bool(settings.mapbox_access_token)


def _token() -> str:
    token = settings.mapbox_access_token
    if not token:
        msg = "Token Mapbox (MAPBOX_ACCESS_TOKEN) není nastavený."
        raise MapboxSearchError(msg)
    return token


def _get_json(path: str, params: dict[str, str | int | float | bool]) -> dict[str, Any]:
    query = urlencode({k: v for k, v in params.items() if v is not None})
    url = f"{_SEARCH_BOX_BASE}/{path}?{query}"
    request = Request(url, headers={"Accept": "application/json"})
    try:
        with urlopen(request, timeout=_TIMEOUT_SEC) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as exc:
        msg = f"Mapbox HTTP {exc.code}"
        raise MapboxSearchError(msg) from exc
    except URLError as exc:
        msg = "Požadavek na Mapbox selhal"
        raise MapboxSearchError(msg) from exc
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        msg = "Neplatná JSON odpověď Mapbox"
        raise MapboxSearchError(msg) from exc


def _proximity(near_lon: float | None, near_lat: float | None) -> str:
    lon = near_lon if near_lon is not None else CHEB_LON
    lat = near_lat if near_lat is not None else CHEB_LAT
    return f"{lon},{lat}"


def _common_params(
    *,
    near_lon: float | None,
    near_lat: float | None,
    limit: int,
    restrict_to_kraj: bool,
) -> dict[str, str | int]:
    params: dict[str, str | int] = {
        "access_token": _token(),
        "language": "cs",
        "country": "CZ",
        "limit": limit,
        "proximity": _proximity(near_lon, near_lat),
    }
    if restrict_to_kraj:
        params["bbox"] = kvk_bbox_param()
    return params


def search_forward(
    query: str,
    *,
    limit: int = 5,
    near_lon: float | None = None,
    near_lat: float | None = None,
    types: str | None = None,
    restrict_to_kraj: bool = True,
) -> list[MapboxPlaceHit]:
    text = query.strip()
    if not text:
        return []
    params = _common_params(
        near_lon=near_lon,
        near_lat=near_lat,
        limit=min(10, max(1, limit)),
        restrict_to_kraj=restrict_to_kraj,
    )
    params["q"] = text[:256]
    if types:
        params["types"] = types
    return hits_from_collection(_get_json("forward", params))


def search_category(
    category_id: str,
    *,
    limit: int = 8,
    near_lon: float | None = None,
    near_lat: float | None = None,
    restrict_to_kraj: bool = True,
) -> list[MapboxPlaceHit]:
    category = category_id.strip()
    if not category:
        return []
    params = _common_params(
        near_lon=near_lon,
        near_lat=near_lat,
        limit=min(25, max(1, limit)),
        restrict_to_kraj=restrict_to_kraj,
    )
    return hits_from_collection(_get_json(f"category/{category}", params))


def reverse_geocode(
    lon: float,
    lat: float,
    *,
    limit: int = 3,
    restrict_to_kraj: bool = True,
) -> list[MapboxPlaceHit]:
    params: dict[str, str | int | float] = {
        "access_token": _token(),
        "language": "cs",
        "country": "CZ",
        "limit": min(10, max(1, limit)),
        "longitude": lon,
        "latitude": lat,
    }
    if restrict_to_kraj:
        params["bbox"] = kvk_bbox_param()
    return hits_from_collection(_get_json("reverse", params))
