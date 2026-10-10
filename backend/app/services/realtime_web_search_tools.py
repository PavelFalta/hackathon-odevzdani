WEB_SEARCH_MAX_PER_TURN = 3

SEARCH_WEB_TOOL = {
    "type": "function",
    "name": "search_web",
    "description": (
        f"Expensive live web search (last resort). Up to {WEB_SEARCH_MAX_PER_TURN} calls per "
        "user turn with refined queries. Use when "
        "search_regional_knowledge, Mapbox, and fetch_place_reviews still leave the question "
        "unanswered (e.g. signature dish, menu detail, event listing). Do not call before "
        "those tools when the place or topic is identifiable. For vague outing requests "
        "(bored, what is on) without a type, clarify first — no search_web that turn. "
        "Not for routes or map camera. For events, copy calendar dates into query and when."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Specific search including place and resolved dates.",
            },
            "when": {
                "type": "string",
                "description": "Resolved range, e.g. 2026-10-10 to 2026-10-11.",
            },
        },
        "required": ["query"],
    },
}

SHOW_TIMETABLE_TOOL = {
    "type": "function",
    "name": "show_timetable",
    "description": (
        "Open or replace the timetable panel with events returned by search_web. "
        "Include only days the user asked about, or upcoming days that have events. "
        "Omit empty days. Never invent events. Skip this tool when search_web found none."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "days": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "date": {"type": "string", "description": "YYYY-MM-DD"},
                        "label": {"type": "string"},
                        "events": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "time": {"type": "string"},
                                    "title": {"type": "string"},
                                    "place": {"type": "string"},
                                    "url": {"type": "string"},
                                },
                                "required": ["title"],
                            },
                        },
                    },
                    "required": ["date", "events"],
                },
            },
        },
        "required": ["days"],
    },
}

REALTIME_WEB_SEARCH_TOOLS = [SEARCH_WEB_TOOL, SHOW_TIMETABLE_TOOL]

KAIROS_WEB_SEARCH_INSTRUCTIONS = f"""\
Live web search (expensive: search_web):
- At most {WEB_SEARCH_MAX_PER_TURN} search_web calls per user turn. Refine the query each time
  (other keywords, Czech and English, venue plus city, menu vs specialty).
- Last resort for facts: try search_regional_knowledge (and Mapbox / fetch_place_reviews when
  relevant) first. If you still cannot answer (signature food, menu, specialty, opening detail,
  local event facts), call search_web — only after {WEB_SEARCH_MAX_PER_TURN} unhelpful attempts
  may you say you could not verify online; never give up after a single empty try.
- Vague outing requests (bored, what is happening, what to do tomorrow) with no type yet:
  reply in Czech with one short question — what they feel like
  (music, market, kids, sport, nature, culture, relax). Do not call search_web that turn.
- For outings, call search_web only after they answer or when the message already names a type
  (e.g. concerts tomorrow, farmers market in Cheb).
- Not for directions or map-only requests; navigation tools answer those.
- Put calendar-snapshot dates into query and when for time-bound outing searches.
- After outing search with events, call show_timetable for those days, summarize in Czech.
- Offer reviews and photos for timetable venues (fetch_place_reviews when they pick or you
  recommend one or two options).
- Timetable rows open reviews in the UI when tapped; still offer aloud.
- If search_web returns no events, use summary only; do not open an empty timetable.\
"""
