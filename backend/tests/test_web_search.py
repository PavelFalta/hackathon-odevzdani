from app.services.web_search import clear_web_search_cache, search_live_web
from app.services.web_search_parse import parse_web_search_payload
from starlette import status


def test_parse_web_search_payload_keeps_found_events() -> None:
    text = """```json
    {"summary":"Víkend ve Vary","events":[
      {"date":"2026-10-10","time":"18:00","title":"Koncert","place":"Karlovy Vary","url":"https://example.com/k"},
      {"date":"bad","title":"Skip me"},
      {"title":"No date"}
    ]}
    ```"""
    result = parse_web_search_payload(text)
    assert result.summary == "Víkend ve Vary"
    assert len(result.events) == 1
    assert result.events[0].title == "Koncert"
    assert result.events[0].url == "https://example.com/k"


def test_search_live_web_uses_one_low_context_call(monkeypatch) -> None:
    clear_web_search_cache()
    seen: dict = {}

    class FakeResponse:
        output_text = (
            '{"summary":"Akce","events":['
            '{"date":"2026-10-10","time":"","title":"Trh","place":"Cheb"}]}'
        )

    class FakeResponses:
        def create(self, **kwargs):
            seen.update(kwargs)
            return FakeResponse()

    class FakeClient:
        responses = FakeResponses()

    monkeypatch.setattr("app.services.web_search.OpenAI", lambda api_key: FakeClient())
    first = search_live_web("co dělat", when="2026-10-10 to 2026-10-11", api_key="sk-test")
    second = search_live_web("co dělat", when="2026-10-10 to 2026-10-11", api_key="sk-test")
    assert first.events[0].title == "Trh"
    assert second.events[0].title == "Trh"
    assert seen["max_tool_calls"] == 1
    assert seen["tools"][0]["search_context_size"] == "low"
    assert seen["tools"][0]["type"] == "web_search"


def test_web_search_requires_openai_key(client, auth_headers, monkeypatch) -> None:
    monkeypatch.setattr("app.api.web_search.settings.openai_api_key", None)
    response = client.post(
        "/api/assistant/web-search",
        headers=auth_headers,
        json={"query": "co dělat tento víkend", "when": "2026-10-10 to 2026-10-11"},
    )
    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE


def test_web_search_api_returns_events(client, auth_headers, monkeypatch) -> None:
    clear_web_search_cache()
    monkeypatch.setattr("app.api.web_search.settings.openai_api_key", "sk-test")

    def fake_search(query: str, *, when: str | None, api_key: str):
        from app.services.web_search_parse import WebEvent, WebSearchResult

        assert query == "festivaly Karlovy Vary"
        assert when == "2026-10-10 to 2026-10-11"
        assert api_key == "sk-test"
        return WebSearchResult(
            summary="Jeden koncert.",
            events=[WebEvent("2026-10-10", "19:00", "Koncert", "Vary", "https://example.com")],
        )

    monkeypatch.setattr("app.api.web_search.search_live_web", fake_search)
    response = client.post(
        "/api/assistant/web-search",
        headers=auth_headers,
        json={"query": "festivaly Karlovy Vary", "when": "2026-10-10 to 2026-10-11"},
    )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["events"][0]["title"] == "Koncert"
    assert body["data_source"]["kind"] == "online"
