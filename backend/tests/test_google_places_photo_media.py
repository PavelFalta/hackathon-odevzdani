from unittest.mock import MagicMock, patch

from app.services.google_places_photo_media import assert_valid_photo_name, fetch_place_photo_media


def test_assert_valid_photo_name_accepts_long_google_reference() -> None:
    ref = "places/ChIJxxx/photos/" + ("A" * 600)
    assert assert_valid_photo_name(ref) == ref


@patch("app.services.google_places_photo_media.urlopen")
def test_fetch_place_photo_media_uses_path_and_api_key_header(mock_urlopen: MagicMock) -> None:
    response = MagicMock()
    response.read.return_value = b"img"
    response.headers = {"Content-Type": "image/jpeg"}
    mock_urlopen.return_value.__enter__.return_value = response

    photo = "places/ChIJxxx/photos/Aa-long_ref"
    fetch_place_photo_media(photo, "secret-key", max_height_px=400, max_width_px=400)

    request = mock_urlopen.call_args[0][0]
    assert request.full_url == (
        "https://places.googleapis.com/v1/places/ChIJxxx/photos/Aa-long_ref/media"
        "?maxHeightPx=400&maxWidthPx=400"
    )
    assert request.headers["X-goog-api-key"] == "secret-key"
