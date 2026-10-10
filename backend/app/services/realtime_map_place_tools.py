HIGHLIGHT_PLACE_OPTIONS_TOOL = {
    "type": "function",
    "name": "highlight_place_options",
    "description": (
        "Show 2-4 candidate places with tall map markers and fit the view. "
        "Use when comparing or shortlisting; pair with reviews/web/knowledge as you see fit."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "places": {
                "type": "array",
                "minItems": 2,
                "maxItems": 4,
                "items": {
                    "type": "object",
                    "properties": {
                        "lon": {"type": "number"},
                        "lat": {"type": "number"},
                        "name": {"type": "string"},
                    },
                    "required": ["lon", "lat", "name"],
                },
            },
        },
        "required": ["places"],
    },
}

FLY_TO_PLACE_TOOL = {
    "type": "function",
    "name": "fly_to_place",
    "description": (
        "Cinematic zoom to one place the user is focusing on. "
        "For multiple candidates on the map, use highlight_place_options instead."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "lon": {"type": "number"},
            "lat": {"type": "number"},
            "name": {"type": "string", "description": "Label shown on the map highlight."},
            "zoom": {"type": "number", "minimum": 8, "maximum": 18},
        },
        "required": ["lon", "lat"],
    },
}

REALTIME_MAP_PLACE_TOOLS = [HIGHLIGHT_PLACE_OPTIONS_TOOL, FLY_TO_PLACE_TOOL]
