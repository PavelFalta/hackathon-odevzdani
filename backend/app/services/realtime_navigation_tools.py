PLAN_ROUTE_TOOL = {
    "type": "function",
    "name": "plan_route",
    "description": (
        "Plan a Mapbox route and open the turn-by-turn navigation panel on the map. "
        "Use coordinates from search_mapbox or search_regional_knowledge when available; "
        "otherwise pass origin/destination place names. Set use_user_location true to "
        "start from the user's saved position. Do not call fly_to_place for the same "
        "request — plan_route handles the map view."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "destination": {
                "type": "string",
                "description": "Destination place name or address.",
            },
            "origin": {
                "type": "string",
                "description": "Optional origin name; omit when use_user_location is true.",
            },
            "use_user_location": {
                "type": "boolean",
                "description": "Start route from the user's current saved location.",
            },
            "from_lon": {"type": "number"},
            "from_lat": {"type": "number"},
            "from_name": {"type": "string"},
            "to_lon": {"type": "number"},
            "to_lat": {"type": "number"},
            "to_name": {"type": "string"},
            "profile": {
                "type": "string",
                "enum": ["driving", "walking", "cycling"],
            },
        },
        "required": ["destination"],
    },
}

OPEN_GOOGLE_MAPS_ROUTE_TOOL = {
    "type": "function",
    "name": "open_google_maps_route",
    "description": (
        "Open the planned route in Google Maps (new browser tab). Call in the same turn as "
        "plan_route or exports when the user asked to open Google Maps / navigation there. "
        "If you also export a map screenshot, call this tool before export_route_map_screenshot "
        "(or pass google_maps_url into export_route_map_screenshot). Pass google_maps_url from "
        "plan_route or the same coordinates."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "google_maps_url": {
                "type": "string",
                "description": "Full URL returned by plan_route.",
            },
            "from_lon": {"type": "number"},
            "from_lat": {"type": "number"},
            "to_lon": {"type": "number"},
            "to_lat": {"type": "number"},
            "profile": {
                "type": "string",
                "enum": ["driving", "walking", "cycling"],
            },
        },
    },
}

EXPORT_ROUTE_STEPS_TOOL = {
    "type": "function",
    "name": "export_route_steps",
    "description": (
        "Download the current navigation route as a .txt file (turn-by-turn steps). "
        "Use after plan_route when the user wants to save or share directions. "
        "Optional window_id from plan_route; defaults to the latest ready route."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "window_id": {
                "type": "string",
                "description": "Navigation panel id from plan_route.",
            },
        },
    },
}

EXPORT_ROUTE_MAP_SCREENSHOT_TOOL = {
    "type": "function",
    "name": "export_route_map_screenshot",
    "description": (
        "Download a PNG screenshot of the map showing the planned route. "
        "Use when the user asks for a map image export. When they also want Google Maps in the "
        "same request, pass google_maps_url so Maps opens before the screenshot (popup-safe). "
        "Optional window_id from plan_route."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "window_id": {
                "type": "string",
                "description": "Navigation panel id from plan_route.",
            },
            "google_maps_url": {
                "type": "string",
                "description": "Optional; opens Google Maps before capturing when combined with export.",
            },
        },
    },
}

REALTIME_NAVIGATION_TOOLS = [
    PLAN_ROUTE_TOOL,
    OPEN_GOOGLE_MAPS_ROUTE_TOOL,
    EXPORT_ROUTE_STEPS_TOOL,
    EXPORT_ROUTE_MAP_SCREENSHOT_TOOL,
]
