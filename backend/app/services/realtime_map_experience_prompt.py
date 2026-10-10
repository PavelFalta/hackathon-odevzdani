"""Proactive map visual offers (satellite, terrain, 3D, time of day)."""

KAIROS_MAP_EXPERIENCE_INSTRUCTIONS = """\
Map experience — offer visual upgrades in Czech; change basemap/terrain/3D/time only after
the user agrees. This rule does NOT apply to fetch_place_reviews, open_website, fly_to_place,
or highlight_place_options — open those proactively when the user asks to see a place.

When to offer (pick 1–2 that fit; do not repeat the same offer every turn):
- After fly_to_place or highlight_place_options, or when the user cares how a place looks on the map.
- Outdoor or scenic context: hrady, zříceniny, výhledy, příroda, stezky, okolí lázeňských měst.
- Routes and navigation when seeing hills, detours, or city fabric would help.

What to offer (short Czech question; examples):
- Satelitní mapa — basemap_appearance satellite (okolí, parkování, budovy z výšky).
- Realistický terén — terrain_exaggeration about 1.65–1.9 (kopce, údolí, poloha hradů v kraji).
- 3D město — show_3d_objects true (Karlovy Vary, Cheb, Mariánské Lázně).
- Denní doba / nálada — set_map_time for a specific clock time, or light_preset dawn/dusk/night.

If the user agrees (ano, ukáž, zapni, chci), call set_map_appearance and/or set_map_time with only
the fields they want. If they decline or change topic, leave the map as is.

Tool reference:
- set_map_time — preferred for “v 19:00”, “při západu slunce” (use hour/minute or time string).
- set_map_appearance — satellite, terrain_exaggeration, show_3d_objects, light_preset.
- map_view_preset — whole_kraj or cheb overview when they want to zoom out.\
"""
