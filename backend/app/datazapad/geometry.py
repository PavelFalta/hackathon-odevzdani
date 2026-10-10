import re
from typing import Any

from app.datazapad.column_keys import column_key

POINT_RE = re.compile(
    r"POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)",
    re.IGNORECASE,
)
COORD_RE = re.compile(r"([-\d.]+)\s+([-\d.]+)")

CZ_LON = (12.0, 19.5)
CZ_LAT = (48.5, 51.2)
MAX_LON = 180.0
MAX_LAT = 90.0


def _in_cz(lon: float, lat: float) -> bool:
    return CZ_LON[0] <= lon <= CZ_LON[1] and CZ_LAT[0] <= lat <= CZ_LAT[1]


def _parse_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", ".").strip())
    except ValueError:
        return None


def _pair_from_xy(x: float, y: float) -> tuple[float, float] | None:
    if _in_cz(x, y):
        return x, y
    if _in_cz(y, x):
        return y, x
    if abs(x) <= MAX_LON and abs(y) <= MAX_LAT:
        return x, y
    return None


def _centroid_from_polygon_wkt(wkt: str) -> tuple[float, float] | None:
    if "POLYGON" not in wkt.upper():
        return None
    nums = COORD_RE.findall(wkt)
    if not nums:
        return None
    lons = [float(a) for a, _ in nums]
    lats = [float(b) for _, b in nums]
    return sum(lons) / len(lons), sum(lats) / len(lats)


def _from_wkt(wkt: str | None) -> tuple[float, float] | None:
    if not wkt:
        return None
    match = POINT_RE.search(wkt)
    if match:
        lon, lat = float(match.group(1)), float(match.group(2))
        pair = _pair_from_xy(lon, lat)
        return pair
    return _centroid_from_polygon_wkt(wkt)


def resolve_coordinates(
    row: dict[str, str], headers: list[str]
) -> tuple[float | None, float | None]:
    by_key = {column_key(h): row.get(h, "") for h in headers}
    x = _parse_float(by_key.get("x"))
    y = _parse_float(by_key.get("y"))
    if x is not None and y is not None:
        pair = _pair_from_xy(x, y)
        if pair:
            return pair

    lon = _parse_float(by_key.get("zeměpisná_délka_v_souřadnicovém_systému_wgs84"))
    lat = _parse_float(by_key.get("zeměpisná_šířka_v_souřadnicovém_systému_wgs84"))
    if lon is not None and lat is not None:
        pair = _pair_from_xy(lon, lat)
        if pair:
            return pair

    for h in headers:
        ck = column_key(h)
        if ck.startswith("zeměpisná_délka"):
            lon = _parse_float(row.get(h))
        if ck.startswith("zeměpisná_šířka"):
            lat = _parse_float(row.get(h))
    if lon is not None and lat is not None:
        pair = _pair_from_xy(lon, lat)
        if pair:
            return pair

    wkt = row.get("geometry_wkt") or row.get("Geometry_WKT")
    if wkt:
        pair = _from_wkt(wkt)
        if pair:
            return pair
    return None, None
