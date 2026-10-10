import json
from unittest.mock import patch

from app.services.mapbox_directions import MapboxDirectionsError, get_route
from starlette import status


def _mock_response(payload: dict) -> bytes:
    return json.dumps(payload).encode("utf-8")


def test_get_route_parses_geometry_and_steps(monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.mapbox_directions.settings.mapbox_access_token",
        "pk.test",
    )
    payload = {
        "code": "Ok",
        "routes": [
            {
                "distance": 4200,
                "duration": 360,
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[12.87, 50.23], [12.88, 50.24]],
                },
                "legs": [
                    {
                        "steps": [
                            {
                                "distance": 100,
                                "duration": 30,
                                "name": "Hlavní",
                                "maneuver": {"instruction": "Zahněte doprava na Hlavní"},
                            },
                        ],
                    },
                ],
            },
        ],
    }
    with patch("app.services.mapbox_directions.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.read.return_value = _mock_response(payload)
        route = get_route(12.87, 50.23, 12.88, 50.24, profile="driving")
    assert route.distance_m == 4200
    assert len(route.steps) == 1
    assert route.steps[0].instruction == "Zahněte doprava na Hlavní"


def test_map_directions_api(client, auth_headers, monkeypatch) -> None:
    monkeypatch.setattr(
        "app.services.mapbox_directions.settings.mapbox_access_token",
        "pk.test",
    )
    payload = {
        "code": "Ok",
        "routes": [
            {
                "distance": 1000,
                "duration": 120,
                "geometry": {"type": "LineString", "coordinates": [[12.0, 50.0], [12.1, 50.1]]},
                "legs": [{"steps": []}],
            },
        ],
    }
    with patch("app.services.mapbox_directions.urlopen") as urlopen:
        urlopen.return_value.__enter__.return_value.read.return_value = _mock_response(payload)
        response = client.post(
            "/api/map/directions",
            headers=auth_headers,
            json={
                "from_lon": 12.0,
                "from_lat": 50.0,
                "to_lon": 12.1,
                "to_lat": 50.1,
                "profile": "walking",
            },
        )
    assert response.status_code == status.HTTP_200_OK
    body = response.json()
    assert body["distance_m"] == 1000
    assert body["profile"] == "walking"


def test_get_route_requires_token(monkeypatch) -> None:
    monkeypatch.setattr("app.services.mapbox_directions.settings.mapbox_access_token", None)
    try:
        get_route(12.0, 50.0, 12.1, 50.1)
    except MapboxDirectionsError as exc:
        assert "MAPBOX" in str(exc)
    else:
        raise AssertionError("expected MapboxDirectionsError")
