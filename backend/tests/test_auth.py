from fastapi.testclient import TestClient
from starlette import status


def test_login_success(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "demo", "password": "demo123"},
    )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["username"] == "demo"
    assert body["role"] == "user"
    assert body["access_token"]


def test_login_rejects_bad_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "demo", "password": "wrong"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_me_requires_token(client: TestClient) -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
