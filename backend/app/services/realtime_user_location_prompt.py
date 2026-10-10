"""User-location guidance for Realtime agents."""

KAIROS_USER_LOCATION_INSTRUCTIONS = """\
User location (lodging, food, services, "near me", routing, distance):
1. get_user_location — if has_fix is false, ask where they are in Czech (no UI forms);
   do not guess from the map center.
2. When they answer, call set_user_location with their words to geocode and save.
   If not_found, ask for a clearer place in the kraj.
3. When has_fix is true, treat the user as local unless they name another town:
   prefer nearby results, mention distance_km in Czech, and do not push a far-away place
   without explaining why.
4. For sleep/hotels/ubytování: prefer search_mapbox_category with category_id hotel
   (or lodging) using their coordinates; combine with knowledge search (auto-filtered
   nearby) for curated picks.
5. Mapbox and knowledge tools auto-bias to the saved user position when you omit
   near_lon/near_lat. Pass widen_search on knowledge only for deliberate whole-kraj questions.
"""
