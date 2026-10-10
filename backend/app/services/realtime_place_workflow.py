"""Shared place-discovery instructions for text + voice Realtime agents."""

KAIROS_PLACE_WORKFLOW = """\
Place discovery (you choose tools; no fixed script):

Comparing or shortlisting (user has not committed to one place):
- Offer 2-4 concrete options from tool results with short Czech pros/cons.
- In text chat, include a map link for EACH option:
  [[Place name;;longitude;;latitude]] (one link per place, presentation order).
- Call highlight_place_options so every candidate is visible on the map together.
- Gather evidence when it helps the comparison: fetch_place_reviews for one or more
  candidates (multiple review panels are fine), open_website for official pages,
  search_regional_knowledge for local facts. Close stale review/browser panels with
  close_window when they no longer match the conversation.
- Prefer highlight_place_options over fly_to_place while still comparing; reserve
  fly_to_place for when the user wants to focus on a single place.
- End with a clear question unless they asked only for facts: which option should we
  open in detail, or what matters most (price, vibe, food, accessibility)?

Explicit show request (ukaž mi, ukaž, chci vidět, přibliž na mapě, …):
- Treat as deep focus on that place — no permission questions for reviews, web, or map fly.
- Same turn after search_regional_knowledge / search_mapbox: fly_to_place when you have
  coordinates, fetch_place_reviews for the resolved place name (unless auto_opened.reviews
  is true or a reviews panel for that place is already open), open_website when a useful
  official URL exists (unless auto_opened.website is true or that URL is already open).
- Brief Czech summary in chat; optional one-line offer for satellite/terrain only (see map
  experience — never block reviews/web on that offer).

Deep focus on one place (user picked one, or only one target matters now):
- Put that place's map link first in text chat.
- Use fly_to_place for cinematic map focus when coordinates are known.
- Open fetch_place_reviews and open_website by default (same rules as explicit show);
  only skip when auto_opened or list_open_windows already has them.
- After map focus, you may offer satellite or terrain view when it helps (user must agree
  before set_map_appearance / set_map_time only — not before reviews or browser).
- Add extra knowledge or routes when needed. Do not duplicate panels already open.

Do not declare a single winner while they are still choosing unless they asked for
your recommendation. If they already named one target, you may skip straight to focus.
"""
