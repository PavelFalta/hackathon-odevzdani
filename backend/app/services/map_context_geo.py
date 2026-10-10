from app.knowledge.models import KnowledgeSearchRequest

_BBOX_LEN = 4
_CENTER_MIN_LEN = 2
_DEFAULT_RADIUS_KM = 15.0


def search_request_with_map(
    query: str,
    limit: int,
    map_context: dict | None,
) -> KnowledgeSearchRequest:
    base = KnowledgeSearchRequest(query=query, limit=limit)
    if not map_context:
        return base
    bbox = map_context.get("bbox")
    if isinstance(bbox, list) and len(bbox) == _BBOX_LEN:
        return base.model_copy(
            update={
                "min_lon": float(bbox[0]),
                "min_lat": float(bbox[1]),
                "max_lon": float(bbox[2]),
                "max_lat": float(bbox[3]),
            }
        )
    center = map_context.get("center")
    if isinstance(center, list) and len(center) >= _CENTER_MIN_LEN:
        radius = map_context.get("radius_km")
        return base.model_copy(
            update={
                "near_lon": float(center[0]),
                "near_lat": float(center[1]),
                "radius_km": float(radius) if radius is not None else _DEFAULT_RADIUS_KM,
            }
        )
    return base
