from unittest.mock import patch

from app.main import app
from app.services.google_places_reviews import PlaceReviewsResult, ReviewItem
from fastapi.testclient import TestClient
from starlette import status

client = TestClient(app)


def _token() -> str:
    login = client.post(
        "/api/auth/login",
        json={"username": "demo", "password": "demo123"},
    )
    return login.json()["access_token"]


def test_reviews_search_ok(monkeypatch) -> None:
    monkeypatch.setattr("app.api.reviews.settings.reviews_api_key", "secret")
    with patch(
        "app.api.reviews.search_place_reviews",
        return_value=PlaceReviewsResult(
            place_name="Test místo",
            rating=4.5,
            rating_count=10,
            reviews=[ReviewItem(author="Marie", rating=5, text="Super.", published_at=None)],
            photos=[],
        ),
    ):
        token = _token()
        response = client.post(
            "/api/reviews/search",
            json={"query": "Karlovy Vary"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["place_name"] == "Test místo"
    assert len(body["reviews"]) == 1


def test_reviews_search_requires_auth() -> None:
    response = client.post("/api/reviews/search", json={"query": "Cheb"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_reviews_photo_media_ok(monkeypatch) -> None:
    monkeypatch.setattr("app.api.reviews.settings.reviews_api_key", "secret")
    with patch(
        "app.api.reviews.fetch_place_photo_media",
        return_value=(b"\xff\xd8\xff", "image/jpeg"),
    ):
        token = _token()
        response = client.get(
            "/api/reviews/photos/media",
            params={"name": "places/ChIJxxx/photos/Abc"},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == status.HTTP_200_OK
    assert response.content == b"\xff\xd8\xff"
    assert response.headers["content-type"].startswith("image/jpeg")
