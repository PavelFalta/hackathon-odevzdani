GET_USER_LOCATION_TOOL = {
    "type": "function",
    "name": "get_user_location",
    "description": (
        "Read whether the user's position is known (GPS or set via set_user_location). "
        "Call before lodging, food, services, 'near me', routing, or distance questions."
    ),
    "parameters": {"type": "object", "properties": {}},
}

SET_USER_LOCATION_TOOL = {
    "type": "function",
    "name": "set_user_location",
    "description": (
        "Geocode and save the user's position from a place name or address in Karlovarský kraj. "
        "After the user tells you where they are, call this to verify the place exists. "
        "On ok=false with error not_found, ask for a clearer town or address and try again."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "What the user said, e.g. 'Cheb' or 'Karlovy Vary, Tržiště'.",
            },
        },
        "required": ["query"],
    },
}

REALTIME_USER_LOCATION_TOOLS = [
    GET_USER_LOCATION_TOOL,
    SET_USER_LOCATION_TOOL,
]
