from app.services import realtime_session
from app.services.realtime_data_source import KAIROS_DATA_SOURCE_INSTRUCTIONS
from app.services.realtime_place_workflow import KAIROS_PLACE_WORKFLOW
from app.services.realtime_tools import KAIROS_REALTIME_INSTRUCTIONS, REALTIME_AGENT_TOOLS
from app.services.realtime_web_search_tools import WEB_SEARCH_MAX_PER_TURN
from starlette import status


def test_realtime_instructions_require_data_source_disclosure() -> None:
    assert KAIROS_DATA_SOURCE_INSTRUCTIONS in KAIROS_REALTIME_INSTRUCTIONS
    assert "datazapad" in KAIROS_REALTIME_INSTRUCTIONS


def test_place_workflow_allows_reviews_while_comparing() -> None:
    assert "fetch_place_reviews" in KAIROS_PLACE_WORKFLOW
    assert "Explicit show request" in KAIROS_PLACE_WORKFLOW
    assert "no permission questions for reviews" in KAIROS_PLACE_WORKFLOW
    assert "Do NOT call fly_to_place" not in KAIROS_PLACE_WORKFLOW
    assert "Do NOT call" not in KAIROS_REALTIME_INSTRUCTIONS


def test_realtime_instructions_offer_map_visual_upgrades() -> None:
    assert "basemap_appearance satellite" in KAIROS_REALTIME_INSTRUCTIONS
    assert "terrain_exaggeration" in KAIROS_REALTIME_INSTRUCTIONS
    assert "user agrees" in KAIROS_REALTIME_INSTRUCTIONS.lower()


def test_realtime_session_includes_agent_tools() -> None:
    config = realtime_session.realtime_session_config()
    names = {tool["name"] for tool in config["tools"]}
    expected = {tool["name"] for tool in REALTIME_AGENT_TOOLS}
    assert names == expected | {"search_web", "show_timetable"}
    assert "fly_to_place" in names
    assert "highlight_place_options" in names
    assert "open_website" in names
    assert "search_mapbox" in names
    assert "get_user_location" in names
    assert "set_user_location" in names


def test_realtime_voice_session_matches_text_tools_and_czech_audio() -> None:
    config = realtime_session.realtime_voice_session_config()
    text = realtime_session.realtime_session_config()
    assert config["output_modalities"] == ["audio"]
    assert {tool["name"] for tool in config["tools"]} == {tool["name"] for tool in text["tools"]}
    turn_detection = config["audio"]["input"]["turn_detection"]
    assert turn_detection["type"] == "server_vad"
    assert turn_detection["create_response"] is True
    assert "format" not in config["audio"]["input"]
    assert "format" not in config["audio"]["output"]
    voice_text = config["instructions"]
    assert "Never say longitude" in voice_text
    assert "[[Place;;lon;;lat]]" in voice_text
    assert "greet them first" in voice_text.lower()
    assert "search_web" in voice_text
    assert "Europe/Prague" in voice_text
    assert f"at most {WEB_SEARCH_MAX_PER_TURN} search_web" in voice_text.lower()
    assert "do not call search_web that turn" in voice_text.lower()
    assert "last resort" in voice_text.lower()
    assert "unhelpful attempts" in voice_text.lower()


def test_realtime_client_secret_requires_openai_key(client, auth_headers, monkeypatch) -> None:
    monkeypatch.setattr(realtime_session.settings, "openai_api_key", None)
    response = client.post(
        "/api/assistant/realtime/client-secret",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE


def test_realtime_client_secret_ok(client, auth_headers, monkeypatch) -> None:
    monkeypatch.setattr(realtime_session.settings, "openai_api_key", "sk-test")

    def fake_create(safety_identifier: str, *, mode: str = "text") -> tuple[str, int]:
        assert safety_identifier == "demo"
        assert mode == "text"
        return "ek_test_secret", 1_700_000_000

    monkeypatch.setattr("app.api.realtime.create_realtime_client_secret", fake_create)
    response = client.post(
        "/api/assistant/realtime/client-secret",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["client_secret"] == "ek_test_secret"
    assert body["expires_at"] == 1_700_000_000
    assert body["conversation_id"]
