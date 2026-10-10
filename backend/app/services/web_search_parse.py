import json
from dataclasses import dataclass


@dataclass(frozen=True)
class WebEvent:
    date: str
    time: str | None
    title: str
    place: str | None
    url: str | None


@dataclass(frozen=True)
class WebSearchResult:
    summary: str
    events: list[WebEvent]


class WebSearchParseError(ValueError):
    pass


_ISO_DATE_LEN = 10


def parse_web_search_payload(text: str) -> WebSearchResult:
    raw = _load_object(text)
    summary = str(raw.get("summary") or "").strip()[:500]
    events = [_event(item) for item in raw.get("events") or []]
    events = [event for event in events if event is not None][:8]
    if not summary and not events:
        raise WebSearchParseError("Web search returned no usable events.")
    return WebSearchResult(summary=summary or "Nic konkrétního jsem nenašel.", events=events)


def _load_object(text: str) -> dict:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = stripped.split("\n", 1)[-1]
        fence = stripped.rfind("```")
        if fence >= 0:
            stripped = stripped[:fence]
    start = stripped.find("{")
    end = stripped.rfind("}")
    if start < 0 or end <= start:
        raise WebSearchParseError("Web search did not return JSON.")
    try:
        payload = json.loads(stripped[start : end + 1])
    except json.JSONDecodeError as exc:
        raise WebSearchParseError("Web search JSON was invalid.") from exc
    if not isinstance(payload, dict):
        raise WebSearchParseError("Web search JSON was not an object.")
    return payload


def _event(item: object) -> WebEvent | None:
    if not isinstance(item, dict):
        return None
    title = str(item.get("title") or "").strip()
    date = str(item.get("date") or "").strip()
    if not title or len(date) != _ISO_DATE_LEN:
        return None
    time = str(item.get("time") or "").strip() or None
    place = str(item.get("place") or "").strip() or None
    url = str(item.get("url") or "").strip() or None
    if url and not url.startswith("http"):
        url = None
    return WebEvent(date=date, time=time, title=title[:160], place=place, url=url)
