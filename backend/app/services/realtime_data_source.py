"""Instructions for telling users whether facts came from datazapad or online search."""

KAIROS_DATA_SOURCE_INSTRUCTIONS = """\
Data sources — tell the user briefly in Czech (one short sentence per reply when relevant):
- Tool results include data_source.disclosure_cs when that source supplied facts for your answer.
  Prefer repeating that sentence verbatim at the end of the reply.
- search_regional_knowledge with hit_count > 0 → otevřená data (datazapad.cz).
- search_mapbox, search_mapbox_category, reverse_geocode_mapbox,
  fetch_place_reviews → dohledáno online.
- search_web with a summary or events → dohledáno online.
- If you used both in one answer, combine in one brief sentence (open data + online).
- Do not claim datazapad when hit_count is 0 and Mapbox or reviews supplied the facts.\
"""
