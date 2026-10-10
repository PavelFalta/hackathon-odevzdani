from starlette import status


def test_assistant_chat_with_knowledge(client, auth_headers, knowledge_dir) -> None:
    response = client.post(
        "/api/assistant/chat",
        json={"messages": [{"role": "user", "content": "knihovna"}]},
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["sources"]
    assert body.get("context")
    assert body["sources"][0].get("chunk_id")
    assert "Knihovna" in body["message"] or "knihovna" in body["message"].lower()


def test_knowledge_status(client, auth_headers, knowledge_dir) -> None:
    response = client.get("/api/knowledge/status", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["ready"] is True
    assert body["total_indexed"] == 3
    assert body["embedder_match"] is True
