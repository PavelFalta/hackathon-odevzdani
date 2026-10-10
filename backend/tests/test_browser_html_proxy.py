from app.services.browser_html_proxy import prepare_proxy_html


def test_prepare_proxy_html_injects_base() -> None:
    raw = "<!DOCTYPE html><html><head><title>x</title></head><body>Hi</body></html>"
    out = prepare_proxy_html(raw, "https://example.org/path")
    assert 'base href="https://example.org/path"' in out
    assert "posledni-kairos-scrollbar" not in out
