import math

EARTH_RADIUS_KM = 6371.0


def haversine_km(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def in_bbox(
    lon: float | None,
    lat: float | None,
    min_lon: float | None,
    min_lat: float | None,
    max_lon: float | None,
    max_lat: float | None,
) -> bool:
    if lon is None or lat is None:
        return False
    if min_lon is not None and lon < min_lon:
        return False
    if max_lon is not None and lon > max_lon:
        return False
    if min_lat is not None and lat < min_lat:
        return False
    return max_lat is None or lat <= max_lat
