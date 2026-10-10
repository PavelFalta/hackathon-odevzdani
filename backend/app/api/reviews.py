from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.config import settings
from app.deps import get_current_user
from app.services.google_places_photo_media import fetch_place_photo_media
from app.services.google_places_reviews import ReviewsServiceError, search_place_reviews

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewsSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)


class ReviewOut(BaseModel):
    author: str
    rating: float | None
    text: str
    published_at: str | None = None


class PhotoAttributionOut(BaseModel):
    display_name: str
    uri: str | None = None


class PlacePhotoOut(BaseModel):
    name: str
    attributions: list[PhotoAttributionOut]


class ReviewsSearchResponse(BaseModel):
    place_name: str
    rating: float | None
    rating_count: int | None
    reviews: list[ReviewOut]
    photos: list[PlacePhotoOut]


@router.post("/search", response_model=ReviewsSearchResponse)
def reviews_search(
    body: ReviewsSearchRequest,
    _user: str = Depends(get_current_user),
) -> ReviewsSearchResponse:
    api_key = settings.reviews_api_key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Služba recenzí není nakonfigurovaná.",
        )
    try:
        result = search_place_reviews(body.query, api_key)
    except ReviewsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)
        ) from exc

    return ReviewsSearchResponse(
        place_name=result.place_name,
        rating=result.rating,
        rating_count=result.rating_count,
        reviews=[
            ReviewOut(
                author=item.author,
                rating=item.rating,
                text=item.text,
                published_at=item.published_at,
            )
            for item in result.reviews
        ],
        photos=[
            PlacePhotoOut(
                name=photo.name,
                attributions=[
                    PhotoAttributionOut(
                        display_name=attr.display_name,
                        uri=attr.uri,
                    )
                    for attr in photo.attributions
                ],
            )
            for photo in result.photos
        ],
    )


@router.get("/photos/media")
def reviews_photo_media(
    name: str = Query(..., min_length=8, max_length=4096),
    max_height_px: int = Query(800, ge=1, le=1600),
    max_width_px: int = Query(800, ge=1, le=1600),
    _user: str = Depends(get_current_user),
) -> Response:
    api_key = settings.reviews_api_key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Služba recenzí není nakonfigurovaná.",
        )
    try:
        body, content_type = fetch_place_photo_media(
            name,
            api_key,
            max_height_px=max_height_px,
            max_width_px=max_width_px,
        )
    except ReviewsServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    return Response(content=body, media_type=content_type)
