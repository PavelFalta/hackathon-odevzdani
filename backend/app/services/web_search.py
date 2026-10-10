import time

from openai import OpenAI, OpenAIError

from app.config import settings
from app.services.local_calendar import calendar_prompt_block
from app.services.web_search_parse import (
    WebSearchParseError,
    WebSearchResult,
    parse_web_search_payload,
)

_CACHE_TTL_S = 900
_CACHE_LIMIT = 32
_cache: dict[str, tuple[float, WebSearchResult]] = {}


class WebSearchError(Exception):
    pass


def clear_web_search_cache() -> None:
    _cache.clear()


def search_live_web(query: str, *, when: str | None, api_key: str) -> WebSearchResult:
    key = f"{query.strip().casefold()}|{when or ''}"
    cached = _cache.get(key)
    if cached and time.monotonic() - cached[0] < _CACHE_TTL_S:
        return cached[1]
    result = _request(query.strip(), when, api_key)
    _cache[key] = (time.monotonic(), result)
    if len(_cache) > _CACHE_LIMIT:
        oldest = min(_cache, key=lambda item: _cache[item][0])
        _cache.pop(oldest, None)
    return result


def _request(query: str, when: str | None, api_key: str) -> WebSearchResult:
    client = OpenAI(api_key=api_key)
    dates = when.strip() if when else "the dates in the query"
    try:
        response = client.responses.create(
            model=settings.web_search_model,
            max_tool_calls=1,
            max_output_tokens=700,
            tools=[
                {
                    "type": "web_search",
                    "search_context_size": "low",
                    "user_location": {
                        "type": "approximate",
                        "country": "CZ",
                        "region": "Karlovarský kraj",
                        "city": "Karlovy Vary",
                        "timezone": "Europe/Prague",
                    },
                }
            ],
            instructions=(
                "Search the live web about Karlovarský kraj, Czechia (events, restaurants, "
                "venues, local facts). Return JSON only: "
                '{"summary": Czech answer, max 500 chars, '
                '"events": [{"date":"YYYY-MM-DD","time":"HH:MM or empty",'
                '"title":"","place":"","url":"https://..."}]}. '
                "Use events only for dated happenings; for menu or specialty questions leave "
                "events [] and put the answer in summary. Max 8 events. Do not invent. "
                + calendar_prompt_block()
            ),
            input=f"Query: {query}\nDates of interest: {dates}",
        )
    except OpenAIError as exc:
        raise WebSearchError("Online vyhledávání se nepodařilo.") from exc
    try:
        return parse_web_search_payload(response.output_text)
    except WebSearchParseError as exc:
        raise WebSearchError("Online vyhledávání nevrátilo použitelné akce.") from exc
