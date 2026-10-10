import json
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.config import settings
from app.services.mapbox_search import mapbox_configured

_DIRECTIONS_BASE = "https://api.mapbox.com/directions/v5/mapbox"
_TIMEOUT_SEC = 20

_PROFILE_MAP = {
    "driving": "driving-traffic",
    "walking": "walking",
    "cycling": "cycling",
}


class MapboxDirectionsError(Exception):
    pass


def mapbox_directions_configured() -> bool:
    return mapbox_configured()


def _token() -> str:
    token = settings.mapbox_access_token
    if not token:
        msg = "Token Mapbox (MAPBOX_ACCESS_TOKEN) není nastavený."
        raise MapboxDirectionsError(msg)
    return token


@dataclass(frozen=True)
class DirectionsStep:
    instruction: str
    distance_m: float
    duration_s: float
    name: str | None

    def as_dict(self) -> dict[str, Any]:
        return {
            "instruction": self.instruction,
            "distance_m": self.distance_m,
            "duration_s": self.duration_s,
            "name": self.name,
        }


@dataclass(frozen=True)
class DirectionsRoute:
    profile: str
    distance_m: float
    duration_s: float
    geometry: dict[str, Any]
    steps: list[DirectionsStep]

    def as_dict(self) -> dict[str, Any]:
        return {
            "profile": self.profile,
            "distance_m": self.distance_m,
            "duration_s": self.duration_s,
            "geometry": self.geometry,
            "steps": [s.as_dict() for s in self.steps],
        }


def _get_json(url: str) -> dict[str, Any]:
    request = Request(url, headers={"Accept": "application/json"})
    try:
        with urlopen(request, timeout=_TIMEOUT_SEC) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as exc:
        msg = f"Mapbox Directions HTTP {exc.code}"
        raise MapboxDirectionsError(msg) from exc
    except URLError as exc:
        msg = "Požadavek na Mapbox Directions selhal"
        raise MapboxDirectionsError(msg) from exc
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        msg = "Neplatná JSON odpověď Mapbox Directions"
        raise MapboxDirectionsError(msg) from exc


def _parse_steps(route: dict[str, Any]) -> list[DirectionsStep]:
    steps: list[DirectionsStep] = []
    for leg in route.get("legs") or []:
        for step in leg.get("steps") or []:
            maneuver = step.get("maneuver") or {}
            instruction = maneuver.get("instruction") or ""
            if not instruction:
                continue
            steps.append(
                DirectionsStep(
                    instruction=str(instruction),
                    distance_m=float(step.get("distance") or 0),
                    duration_s=float(step.get("duration") or 0),
                    name=(step.get("name") or None),
                ),
            )
    return steps


def get_route(
    from_lon: float,
    from_lat: float,
    to_lon: float,
    to_lat: float,
    *,
    profile: str = "driving",
) -> DirectionsRoute:
    if profile not in _PROFILE_MAP:
        msg = f"Nepodporovaný režim trasy: {profile}"
        raise MapboxDirectionsError(msg)
    mapbox_profile = _PROFILE_MAP[profile]
    coords = f"{from_lon},{from_lat};{to_lon},{to_lat}"
    params = urlencode(
        {
            "access_token": _token(),
            "geometries": "geojson",
            "steps": "true",
            "language": "cs",
            "overview": "full",
        },
    )
    url = f"{_DIRECTIONS_BASE}/{mapbox_profile}/{coords}?{params}"
    payload = _get_json(url)
    if payload.get("code") != "Ok":
        code = payload.get("code") or "unknown"
        msg = f"Mapbox Directions selhalo: {code}"
        raise MapboxDirectionsError(msg)
    routes = payload.get("routes") or []
    if not routes:
        msg = "Trasa nenalezena"
        raise MapboxDirectionsError(msg)
    route = routes[0]
    geometry = route.get("geometry")
    if not geometry:
        msg = "Trasa neobsahuje geometrii"
        raise MapboxDirectionsError(msg)
    return DirectionsRoute(
        profile=profile,
        distance_m=float(route.get("distance") or 0),
        duration_s=float(route.get("duration") or 0),
        geometry=geometry,
        steps=_parse_steps(route),
    )
