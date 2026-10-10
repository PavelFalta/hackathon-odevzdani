from app.services.realtime_map_place_tools import REALTIME_MAP_PLACE_TOOLS
from app.services.realtime_mapbox_tools import REALTIME_MAPBOX_TOOLS
from app.services.realtime_navigation_tools import REALTIME_NAVIGATION_TOOLS
from app.services.realtime_place_workflow import KAIROS_PLACE_WORKFLOW
from app.services.realtime_user_location_prompt import KAIROS_USER_LOCATION_INSTRUCTIONS
from app.services.realtime_user_location_tools import REALTIME_USER_LOCATION_TOOLS
from app.services.realtime_data_source import KAIROS_DATA_SOURCE_INSTRUCTIONS
from app.services.realtime_map_experience_prompt import KAIROS_MAP_EXPERIENCE_INSTRUCTIONS
from app.services.realtime_window_tools import REALTIME_WINDOW_TOOLS, WINDOW_TURN_HOUSEKEEPING

SEARCH_REGIONAL_KNOWLEDGE_TOOL = {
    "type": "function",
    "name": "search_regional_knowledge",
    "description": (
        "Search open regional data (datazapad.cz index for Karlovarský kraj). Returns name, web URL, coordinates, "
        "and distance_km when the user's position is known. When hit_count is 1 and the hit "
        "is nearby, the app may auto-open reviews and the website. Set widen_search true "
        "for whole-region topics without a distance filter."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "limit": {"type": "integer", "minimum": 1, "maximum": 12},
            "near_lon": {"type": "number"},
            "near_lat": {"type": "number"},
            "radius_km": {"type": "number", "minimum": 1, "maximum": 200},
            "widen_search": {
                "type": "boolean",
                "description": "Skip default nearby radius when the user wants the whole kraj.",
            },
        },
        "required": ["query"],
    },
}

OPEN_WEBSITE_TOOL = {
    "type": "function",
    "name": "open_website",
    "description": (
        "Open a URL in the in-app browser (http/https). The backend checks embeddability; "
        "if the page cannot be shown, the panel stays hidden. Do not retry failed URLs."
    ),
    "parameters": {
        "type": "object",
        "properties": {"url": {"type": "string", "description": "Full https:// URL."}},
        "required": ["url"],
    },
}

FETCH_PLACE_REVIEWS_TOOL = {
    "type": "function",
    "name": "fetch_place_reviews",
    "description": (
        "Look up Google place reviews (and photos when available). Opens reviews and photo "
        "panels. Use for one place or several when comparing; skip if search_regional_knowledge "
        "just auto-opened reviews for the same place (hit_count=1)."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Place name or address, e.g. 'Hotel Thermal Karlovy Vary'.",
            },
        },
        "required": ["query"],
    },
}

SET_MAP_TIME_TOOL = {
    "type": "function",
    "name": "set_map_time",
    "description": (
        "Set the map clock (24h) and lighting. Animates the time wheel in the UI. "
        "Use hour/minute or a time string like 14:30."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "hour": {"type": "integer", "minimum": 0, "maximum": 23},
            "minute": {"type": "integer", "minimum": 0, "maximum": 59},
            "time": {
                "type": "string",
                "description": "24-hour clock HH:MM when hour/minute are omitted.",
            },
        },
    },
}

SET_MAP_APPEARANCE_TOOL = {
    "type": "function",
    "name": "set_map_appearance",
    "description": (
        "Change map visuals after the user accepts an offer: standard vs satellite imagery, "
        "terrain relief (exaggeration), 3D buildings, or coarse day/night light_preset. "
        "Only pass fields you want to change."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "light_preset": {"type": "string", "enum": ["day", "dawn", "dusk", "night"]},
            "basemap_appearance": {"type": "string", "enum": ["standard", "satellite"]},
            "terrain_exaggeration": {"type": "number", "minimum": 0.6, "maximum": 2},
            "show_3d_objects": {"type": "boolean"},
        },
    },
}

MAP_VIEW_PRESET_TOOL = {
    "type": "function",
    "name": "map_view_preset",
    "description": "Jump the map to a named overview: whole region or Cheb city focus.",
    "parameters": {
        "type": "object",
        "properties": {
            "preset": {"type": "string", "enum": ["whole_kraj", "cheb"]},
        },
        "required": ["preset"],
    },
}

REALTIME_AGENT_TOOLS = [
    SEARCH_REGIONAL_KNOWLEDGE_TOOL,
    *REALTIME_MAPBOX_TOOLS,
    OPEN_WEBSITE_TOOL,
    FETCH_PLACE_REVIEWS_TOOL,
    *REALTIME_NAVIGATION_TOOLS,
    *REALTIME_WINDOW_TOOLS,
    *REALTIME_MAP_PLACE_TOOLS,
    SET_MAP_TIME_TOOL,
    SET_MAP_APPEARANCE_TOOL,
    MAP_VIEW_PRESET_TOOL,
    *REALTIME_USER_LOCATION_TOOLS,
]

KAIROS_REALTIME_INSTRUCTIONS = (
    """\
You are Kairos, the map assistant for Karlovarský kraj (Czechia).
Always answer in Czech unless the user explicitly asks for another language.
Be concise and proactive with the UI tools.

"""
    + KAIROS_PLACE_WORKFLOW
    + """

Knowledge search with exactly one hit (hit_count=1):
- The client automatically opens reviews (and photos when Google returns them) and tries its web URL.
- Check auto_opened in the tool result; do not call fetch_place_reviews or open_website again
  unless the user asks or auto_opened failed.

When discussing places:
1. search_regional_knowledge for facts, coordinates, and web links.
2. If knowledge has no useful hit, use search_mapbox or search_mapbox_category.
3. highlight_place_options when showing several candidates; fly_to_place when focusing on one.
4. fetch_place_reviews when comparing, on any explicit “show me this place” request, or when
   focusing on one named place; names from knowledge or Mapbox. Skip only if auto_opened.reviews
   is true or a reviews panel for that place is already open (reused: true or list_open_windows).
5. open_website when a site helps and auto_opened.website is false or the user wants another URL.
   Skip if that URL is already open in the browser panel (reused: true).
6. plan_route when the user wants directions or navigation; prefer coordinates from prior tools.
   If they want Google Maps / navigation in Google in the same request, call
   open_google_maps_route with google_maps_url from plan_route (same turn; before any export).
   export_route_steps / export_route_map_screenshot when they want a file download; combine with
   open_google_maps_route or google_maps_url on export when they asked for both.
7. search_web only as last resort when steps 1-5 (and reviews) still do not answer a factual
   question (food, menu, specialty, events). Up to three refined search_web calls per turn; see
   web search rules.

"""
    + KAIROS_USER_LOCATION_INSTRUCTIONS
    + """

Mapbox tools default to Karlovarský kraj and Czech language.
reverse_geocode_mapbox explains coordinates on the map.

Map links in chat (required for every named place you mention with known coordinates):
Wrap the display name and coordinates from tool results as
[[Place name;;longitude;;latitude]] (longitude, latitude, semicolon-separated).
When focusing on one place, put its map link first; when comparing, order is presentation only.
Example: [[Hotel Thermal;;12.871234;;50.231045]]. Users click any link to revisit.
Never invent coordinates; only use values from tools.

open_website: if ok is false, tell the user the site cannot be shown in-app (embedding blocked).

"""
    + WINDOW_TURN_HOUSEKEEPING
    + """

"""
    + KAIROS_MAP_EXPERIENCE_INSTRUCTIONS
    + """

Ground factual claims in tool results; do not invent places or URLs.

"""
    + KAIROS_DATA_SOURCE_INSTRUCTIONS
)
