from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.deps import get_current_user
from app.services.mapbox_search import (
    MapboxSearchError,
    mapbox_configured,
    reverse_geocode,
    search_category,
    search_forward,
)

router = APIRouter(prefix="/map/search", tags=["map"])


class MapboxForwardBody(BaseModel):
    query: str = Field(..., min_length=1, max_length=256)
    limit: int = Field(default=5, ge=1, le=10)
    near_lon: float | None = None
    near_lat: float | None = None
    types: str | None = Field(
        default=None,
        description="Comma-separated Search Box types, e.g. poi,address,place",
    )
    restrict_to_kraj: bool = True


class MapboxCategoryBody(BaseModel):
    category_id: str = Field(..., min_length=1, max_length=80)
    limit: int = Field(default=8, ge=1, le=25)
    near_lon: float | None = None
    near_lat: float | None = None
    restrict_to_kraj: bool = True


class MapboxReverseBody(BaseModel):
    lon: float
    lat: float
    limit: int = Field(default=3, ge=1, le=10)
    restrict_to_kraj: bool = True


class MapboxSearchResponse(BaseModel):
    hit_count: int
    hits: list[dict]


def _mapbox_unavailable() -> None:
    if not mapbox_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Token Mapbox (MAPBOX_ACCESS_TOKEN) není nastavený.",
        )


def _run_search(fn) -> MapboxSearchResponse:
    _mapbox_unavailable()
    try:
        hits = fn()
    except MapboxSearchError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    rows = [hit.as_dict() for hit in hits]
    return MapboxSearchResponse(hit_count=len(rows), hits=rows)


@router.post("/forward", response_model=MapboxSearchResponse)
async def map_search_forward(
    body: MapboxForwardBody,
    _user: str = Depends(get_current_user),
) -> MapboxSearchResponse:
    return _run_search(
        lambda: search_forward(
            body.query,
            limit=body.limit,
            near_lon=body.near_lon,
            near_lat=body.near_lat,
            types=body.types,
            restrict_to_kraj=body.restrict_to_kraj,
        ),
    )


@router.post("/category", response_model=MapboxSearchResponse)
async def map_search_category(
    body: MapboxCategoryBody,
    _user: str = Depends(get_current_user),
) -> MapboxSearchResponse:
    return _run_search(
        lambda: search_category(
            body.category_id,
            limit=body.limit,
            near_lon=body.near_lon,
            near_lat=body.near_lat,
            restrict_to_kraj=body.restrict_to_kraj,
        ),
    )


@router.post("/reverse", response_model=MapboxSearchResponse)
async def map_search_reverse(
    body: MapboxReverseBody,
    _user: str = Depends(get_current_user),
) -> MapboxSearchResponse:
    return _run_search(
        lambda: reverse_geocode(
            body.lon,
            body.lat,
            limit=body.limit,
            restrict_to_kraj=body.restrict_to_kraj,
        ),
    )
