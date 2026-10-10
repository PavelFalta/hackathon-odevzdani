LIST_OPEN_WINDOWS_TOOL = {
    "type": "function",
    "name": "list_open_windows",
    "description": (
        "List open in-app UI windows (max 4, one per screen corner). Each entry has window_id, "
        "kind (assistant, reviews, photos, browser, navigation, timetable), and label. "
        "Call at the start of every "
        "user turn before other tools."
    ),
    "parameters": {"type": "object", "properties": {}},
}

CLOSE_WINDOW_TOOL = {
    "type": "function",
    "name": "close_window",
    "description": (
        "Close a floating UI window by window_id from list_open_windows. Use after "
        "list_open_windows to remove reviews, browser, navigation, or timetable "
        "panels no longer relevant to the current user request."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "window_id": {"type": "string", "description": "Id from list_open_windows."},
        },
        "required": ["window_id"],
    },
}

REALTIME_WINDOW_TOOLS = [LIST_OPEN_WINDOWS_TOOL, CLOSE_WINDOW_TOOL]

WINDOW_TURN_HOUSEKEEPING = """\
Window housekeeping (every new user message or voice turn, before other tools):
1. Call list_open_windows.
2. close_window on reviews, browser, navigation, or timetable panels
   whose place, site, or program is not needed for this turn.
   Keep panels that still support compare, follow-up, or the user's new question.
3. Never close kind=assistant unless the user asks to hide it.
At most four floating panels exist (corners only); opening another may auto-close the oldest
reviews, browser, navigation, or timetable panel.
Prefer close_window for stale panels before opening new ones.\
"""
