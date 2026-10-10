import re
from html import escape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.services.embed_frame_fetch import validate_public_http_url

_MAX_BYTES = 1_500_000
_TIMEOUT_SEC = 15
_USER_AGENT = "PosledniBrowserPreview/1.0"


class BrowserHtmlProxyError(Exception):
    pass


def _head_injection(base_url: str) -> str:
    safe_base = escape(base_url, quote=True)
    return f'<base href="{safe_base}">'


def prepare_proxy_html(html: str, base_url: str) -> str:
    injection = _head_injection(base_url)
    match = re.search(r"<head[^>]*>", html, flags=re.IGNORECASE)
    if match:
        idx = match.end()
        return html[:idx] + injection + html[idx:]
    match = re.search(r"<html[^>]*>", html, flags=re.IGNORECASE)
    if match:
        idx = match.end()
        return html[:idx] + f"<head>{injection}</head>" + html[idx:]
    return f"<!DOCTYPE html><html><head>{injection}</head><body>{html}</body></html>"


def fetch_proxy_html(url: str) -> tuple[str, str]:
    validate_public_http_url(url)
    request = Request(
        url, method="GET", headers={"User-Agent": _USER_AGENT, "Accept-Language": "cs"}
    )
    try:
        with urlopen(request, timeout=_TIMEOUT_SEC) as response:
            final_url = response.url
            raw = response.read(_MAX_BYTES + 1)
    except HTTPError as exc:
        raise BrowserHtmlProxyError("Stránku se nepodařilo načíst.") from exc
    except URLError as exc:
        raise BrowserHtmlProxyError("Stránku se nepodařilo načíst.") from exc

    if len(raw) > _MAX_BYTES:
        raise BrowserHtmlProxyError("Stránka je příliš velká pro náhled.")

    charset = "utf-8"
    text = raw.decode(charset, errors="replace")
    if "<html" not in text.lower():
        raise BrowserHtmlProxyError("Odpověď není HTML stránka.")

    return prepare_proxy_html(text, final_url), final_url
