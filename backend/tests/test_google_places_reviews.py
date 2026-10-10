from app.services.google_places_photos import PhotoAttribution
from app.services.google_places_reviews import _parse_place, search_place_reviews


def test_parse_place_maps_reviews() -> None:
    raw = {
        "displayName": {"text": "Rozhledna"},
        "rating": 4.6,
        "userRatingCount": 120,
        "reviews": [
            {
                "rating": 5,
                "text": {"text": "Krásný výhled."},
                "authorAttribution": {"displayName": "Jan"},
                "publishTime": "2024-01-02T10:00:00Z",
            },
        ],
    }
    result = _parse_place(raw)
    assert result.place_name == "Rozhledna"
    assert result.rating == 4.6
    assert len(result.reviews) == 1
    assert result.reviews[0].text == "Krásný výhled."
    assert result.photos == []


def test_parse_place_maps_photos() -> None:
    raw = {
        "displayName": {"text": "Hotel"},
        "photos": [
            {
                "name": "places/ChIJxxx/photos/Abc123",
                "authorAttributions": [
                    {"displayName": "Jan Novák", "uri": "https://maps.google.com/"},
                ],
            },
        ],
    }
    result = _parse_place(raw)
    assert len(result.photos) == 1
    assert result.photos[0].name == "places/ChIJxxx/photos/Abc123"
    assert result.photos[0].attributions == [
        PhotoAttribution(display_name="Jan Novák", uri="https://maps.google.com/"),
    ]


def test_search_requires_query() -> None:
    from app.services.google_places_reviews import ReviewsServiceError

    try:
        search_place_reviews("   ", "test-key")
    except ReviewsServiceError as exc:
        assert "Zadej" in str(exc)
    else:
        raise AssertionError("expected ReviewsServiceError")
