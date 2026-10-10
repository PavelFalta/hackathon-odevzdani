from openai import OpenAI

from app.config import settings
from app.services.local_calendar import calendar_prompt_block
from app.services.realtime_tools import KAIROS_REALTIME_INSTRUCTIONS, REALTIME_AGENT_TOOLS
from app.services.realtime_voice_prompt import KAIROS_REALTIME_VOICE_INSTRUCTIONS
from app.services.realtime_web_search_tools import (
    KAIROS_WEB_SEARCH_INSTRUCTIONS,
    REALTIME_WEB_SEARCH_TOOLS,
)


def _agent_session_core(instructions: str) -> dict:
    composed = f"{instructions}\n\n{KAIROS_WEB_SEARCH_INSTRUCTIONS}\n\n{calendar_prompt_block()}"
    return {
        "type": "realtime",
        "model": settings.realtime_model,
        "instructions": composed,
        "tools": [*REALTIME_AGENT_TOOLS, *REALTIME_WEB_SEARCH_TOOLS],
        "tool_choice": "auto",
    }


def realtime_session_config() -> dict:
    return {
        **_agent_session_core(KAIROS_REALTIME_INSTRUCTIONS),
        "output_modalities": ["text"],
        "reasoning": {"effort": "medium"},
        "audio": {"input": {"turn_detection": None}},
    }


def realtime_voice_session_config() -> dict:
    return {
        **_agent_session_core(KAIROS_REALTIME_VOICE_INSTRUCTIONS),
        "output_modalities": ["audio"],
        "audio": {
            "input": {
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 350,
                    "create_response": True,
                    "interrupt_response": True,
                },
            },
            "output": {"voice": "marin"},
        },
    }


def create_realtime_client_secret(
    safety_identifier: str,
    *,
    mode: str = "text",
) -> tuple[str, int]:
    if not settings.openai_api_key:
        msg = "OPENAI_API_KEY není nakonfigurován"
        raise ValueError(msg)
    session = realtime_voice_session_config() if mode == "voice" else realtime_session_config()
    client = OpenAI(api_key=settings.openai_api_key)
    created = client.realtime.client_secrets.create(
        session=session,
        extra_headers={"OpenAI-Safety-Identifier": safety_identifier},
    )
    return created.value, created.expires_at
