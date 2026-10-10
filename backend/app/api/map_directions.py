from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import get_current_user_row, parse_conversation_header
from app.services.usage_log import record_usage
from app.services.mapbox_directions import (
    MapboxDirectionsError,
    mapbox_directions_configured,
    get_route,
)

router = APIRouter(prefix="/map/directions", tags=["map"])

RouteProfile = Literal["driving", "walking", "cycling"]


class DirectionsBody(BaseModel):
    from_lon: float
    from_lat: float
    to_lon: float
    to_lat: float
    profile: RouteProfile = "driving"


class DirectionsStepOut(BaseModel):
    instruction: str
    distance_m: float
    duration_s: float
    name: str | None


class DirectionsResponse(BaseModel):
    profile: RouteProfile
    distance_m: float
    duration_s: float
    geometry: dict
    steps: list[DirectionsStepOut]


@router.post("", response_model=DirectionsResponse)
async def map_directions(
    body: DirectionsBody,
    user=Depends(get_current_user_row),
    db: Session = Depends(get_db),
    x_kairos_conversation_id: str | None = Header(default=None),
) -> DirectionsResponse:
    if not mapbox_directions_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Token Mapbox (MAPBOX_ACCESS_TOKEN) není nastavený.",
        )
    try:
        route = get_route(
            body.from_lon,
            body.from_lat,
            body.to_lon,
            body.to_lat,
            profile=body.profile,
        )
    except MapboxDirectionsError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    record_usage(
        db,
        user_id=user.id,
        conversation_id=parse_conversation_header(x_kairos_conversation_id),
        category="mapbox",
        label="directions",
        quantity=1,
        meta={"profile": body.profile},
    )
    db.commit()
    return DirectionsResponse(
        profile=body.profile,
        distance_m=route.distance_m,
        duration_s=route.duration_s,
        geometry=route.geometry,
        steps=[DirectionsStepOut(**s.as_dict()) for s in route.steps],
    )
