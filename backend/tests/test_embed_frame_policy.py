from app.services.embed_frame_policy import embed_blocked_reason, resource_origin


def test_x_frame_options_deny() -> None:
    headers = {"x-frame-options": "DENY"}
    reason = embed_blocked_reason(
        headers,
        ancestor_origin="https://app.example",
        final_url="https://www.kudyznudy.cz/page",
    )
    assert reason is not None


def test_frame_ancestors_none() -> None:
    headers = {"content-security-policy": "frame-ancestors 'none'"}
    reason = embed_blocked_reason(
        headers,
        ancestor_origin="https://app.example",
        final_url="https://www.kudyznudy.cz/",
    )
    assert reason is not None


def test_allows_when_no_framing_headers() -> None:
    reason = embed_blocked_reason(
        {},
        ancestor_origin="https://app.example",
        final_url="https://example.org/",
    )
    assert reason is None


def test_resource_origin_default_ports() -> None:
    assert resource_origin("https://example.org/path") == "https://example.org"
