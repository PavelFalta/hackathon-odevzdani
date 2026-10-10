from starlette import status


def test_assistant_requires_auth(client) -> None:
    response = client.post(
        "/api/assistant/chat",
        json={"messages": [{"role": "user", "content": "hi"}]},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
