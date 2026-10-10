"""Karlovarský kraj bounds — keep in sync with frontend `region.ts` KVK_BOUNDS."""

KVK_MIN_LON = 12.090655826881756
KVK_MIN_LAT = 49.890521978525065
KVK_MAX_LON = 13.301826758606405
KVK_MAX_LAT = 50.46040361556867

CHEB_LON = 12.3736
CHEB_LAT = 50.0736


def kvk_bbox_param() -> str:
    return f"{KVK_MIN_LON},{KVK_MIN_LAT},{KVK_MAX_LON},{KVK_MAX_LAT}"
