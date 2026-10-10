from unittest.mock import patch

from app.main import app
from fastapi.testclient import TestClient
from starlette import status

client = TestClient(app)


def _token() -> str:
    login = client.post(
        "/api/auth/login",
        json={"username": "demo", "password": "demo123"},
    )
    return login.json()["access_token"]


def test_embed_check_requires_auth() -> None:
    response = client.get(
        "/api/browser/embed-check",
        params={"url": "https://example.org", "ancestor": "https://app.test"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@patch(
    "app.api.browser.check_embeddable",
    return_value=(False, "Tento web nepovoluje vložený náhled."),
)
def test_embed_check_reports_blocked(_mock) -> None:
    token = _token()
    response = client.get(
        "/api/browser/embed-check",
        params={"url": "https://www.kudyznudy.cz/", "ancestor": "http://localhost:5173"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["embeddable"] is False
    assert "vložen" in body["reason"].lower()
