import json
from unittest.mock import patch

from app.services.mapbox_search import MapboxSearchError, search_category, search_forward
from starlette import status


def _mock_response(payload: dict) -> bytes:
    return json.dumps(payload).encode("utf-8")


def test_search_forward_parses_features(monkeypatch) -> None:
    expected_lon = 12.87
    expected_lat = 50.23
    monkeypatch.setattr(
        "app.services.mapbox_search.settings.mapbox_access_token",
        "pk.test",
    )
    payload = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [expected_lon, expected_lat]},
                "properties": {
                    "name": "Hotel Thermal",
                    "feature_type": "poi",
                    "full_address": "Karlovy Vary",
                    "mapbox_id": "abc",
                    "distance": 1200,
                },
            },
        ],
    }
    with patch("app.services.mapbox_search.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.read.return_value = _mock_response(payload)
        hits = search_forward("thermal karlovy vary", limit=3)
    assert len(hits) == 1
    assert hits[0].name == "Hotel Thermal"
    assert hits[0].lon == expected_lon
    assert hits[0].lat == expected_lat


def test_search_forward_requires_token(monkeypatch) -> None:
    monkeypatch.setattr("app.services.mapbox_search.settings.mapbox_access_token", None)
    try:
        search_forward("test")
    except MapboxSearchError as exc:
        assert "MAPBOX" in str(exc)
    else:
        raise AssertionError("expected MapboxSearchError")


def test_map_search_forward_api(client, auth_headers, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.mapbox_search.settings.mapbox_access_token",
        "pk.test",
    )
    payload = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [12.37, 50.07]},
                "properties": {"name": "Cheb", "feature_type": "place"},
            },
        ],
    }
    with patch("app.services.mapbox_search.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.read.return_value = _mock_response(payload)
        response = client.post(
            "/api/map/search/forward",
            headers=auth_headers,
            json={"query": "Cheb", "limit": 2},
        )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["hit_count"] == 1
    assert body["hits"][0]["name"] == "Cheb"


def test_reverse_geocode_api(client, auth_headers, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.mapbox_search.settings.mapbox_access_token",
        "pk.test",
    )
    payload = {"type": "FeatureCollection", "features": []}
    with patch("app.services.mapbox_search.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.read.return_value = _mock_response(payload)
        response = client.post(
            "/api/map/search/reverse",
            headers=auth_headers,
            json={"lon": 12.87, "lat": 50.23},
        )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["hit_count"] == 0


def test_category_search_builds_path(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.mapbox_search.settings.mapbox_access_token",
        "pk.test",
    )
    payload = {"type": "FeatureCollection", "features": []}
    with patch("app.services.mapbox_search.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.read.return_value = _mock_response(payload)
        search_category("gas_station", limit=5)
        called_url = urlopen.call_args[0][0].full_url
        assert "/category/gas_station" in called_url
