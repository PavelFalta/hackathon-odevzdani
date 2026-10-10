from starlette import status


def test_admin_usage_requires_admin(client) -> None:
    login = client.post("/api/auth/login", json={"username": "demo", "password": "demo123"})
    token = login.json()["access_token"]
    response = client.get("/api/admin/usage", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_usage_lists_demo_user(client) -> None:
    admin = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = admin.json()["access_token"]
    response = client.get("/api/admin/usage", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == status.HTTP_200_OK
    rows = response.json()
    assert any(row["username"] == "demo" for row in rows)


def test_conversations_empty_for_new_user(client, auth_headers) -> None:
    response = client.get("/api/assistant/conversations", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []
