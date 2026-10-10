from dataclasses import dataclass
from typing import Any

_MIN_COORD_PARTS = 2


@dataclass(frozen=True)
class MapboxPlaceHit:
    name: str
    feature_type: str | None
    full_address: str | None
    lon: float
    lat: float
    distance_m: float | None
    mapbox_id: str | None
    poi_category: list[str] | None
    website: str | None

    def as_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "feature_type": self.feature_type,
            "full_address": self.full_address,
            "lon": self.lon,
            "lat": self.lat,
            "distance_m": self.distance_m,
            "mapbox_id": self.mapbox_id,
            "poi_category": self.poi_category,
            "website": self.website,
        }


def _coords_from_feature(feature: dict[str, Any]) -> tuple[float, float] | None:
    geometry = feature.get("geometry") or {}
    coords = geometry.get("coordinates")
    if isinstance(coords, list) and len(coords) >= _MIN_COORD_PARTS:
        return float(coords[0]), float(coords[1])
    props = feature.get("properties") or {}
    nested = props.get("coordinates") or {}
    lon = nested.get("longitude")
    lat = nested.get("latitude")
    if lon is not None and lat is not None:
        return float(lon), float(lat)
    return None


def feature_to_hit(feature: dict[str, Any]) -> MapboxPlaceHit | None:
    coords = _coords_from_feature(feature)
    if coords is None:
        return None
    lon, lat = coords
    props = feature.get("properties") or {}
    metadata = props.get("metadata") or {}
    website = metadata.get("website")
    if website is not None:
        website = str(website)
    categories = props.get("poi_category")
    if categories is not None and not isinstance(categories, list):
        categories = None
    distance = props.get("distance")
    return MapboxPlaceHit(
        name=str(props.get("name") or ""),
        feature_type=props.get("feature_type"),
        full_address=props.get("full_address") or props.get("place_formatted"),
        lon=lon,
        lat=lat,
        distance_m=float(distance) if isinstance(distance, (int, float)) else None,
        mapbox_id=props.get("mapbox_id"),
        poi_category=categories,
        website=website,
    )


def hits_from_collection(payload: dict[str, Any]) -> list[MapboxPlaceHit]:
    features = payload.get("features")
    if not isinstance(features, list):
        return []
    out: list[MapboxPlaceHit] = []
    for feature in features:
        if not isinstance(feature, dict):
            continue
        hit = feature_to_hit(feature)
        if hit and hit.name:
            out.append(hit)
    return out
