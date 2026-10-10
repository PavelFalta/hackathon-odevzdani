SEARCH_MAPBOX_TOOL = {
    "type": "function",
    "name": "search_mapbox",
    "description": (
        "Mapbox text search for addresses, places, and POIs when regional knowledge "
        "has no good hit. Biased to Karlovarský kraj; pass near_lon/near_lat from map "
        "or a prior hit. Returns coordinates for fly_to_place."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "limit": {"type": "integer", "minimum": 1, "maximum": 10},
            "near_lon": {"type": "number"},
            "near_lat": {"type": "number"},
            "types": {
                "type": "string",
                "description": "Optional Search Box types filter, e.g. poi or address,place",
            },
        },
        "required": ["query"],
    },
}

SEARCH_MAPBOX_CATEGORY_TOOL = {
    "type": "function",
    "name": "search_mapbox_category",
    "description": (
        "List nearby POIs in a Mapbox category (canonical id), e.g. gas_station, "
        "restaurant, food_and_drink, hotel, lodging, cafe. Best for sleep/food/fuel near "
        "the user; proximity uses saved user location when near_lon/near_lat are omitted."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "category_id": {"type": "string"},
            "limit": {"type": "integer", "minimum": 1, "maximum": 25},
            "near_lon": {"type": "number"},
            "near_lat": {"type": "number"},
        },
        "required": ["category_id"],
    },
}

REVERSE_GEOCODE_MAPBOX_TOOL = {
    "type": "function",
    "name": "reverse_geocode_mapbox",
    "description": (
        "Resolve coordinates to the nearest address or place names via Mapbox. "
        "Useful when the user points at the map or gives lon/lat."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "lon": {"type": "number"},
            "lat": {"type": "number"},
            "limit": {"type": "integer", "minimum": 1, "maximum": 10},
        },
        "required": ["lon", "lat"],
    },
}

REALTIME_MAPBOX_TOOLS = [
    SEARCH_MAPBOX_TOOL,
    SEARCH_MAPBOX_CATEGORY_TOOL,
    REVERSE_GEOCODE_MAPBOX_TOOL,
]
