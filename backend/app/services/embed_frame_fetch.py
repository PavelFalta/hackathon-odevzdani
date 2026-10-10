import ipaddress
import socket
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

_USER_AGENT = "PosledniEmbedCheck/1.0"
_TIMEOUT_SEC = 10


class EmbedFetchError(Exception):
    pass


def _hostname_blocked(host: str) -> bool:
    lowered = host.lower().rstrip(".")
    if lowered in {"localhost", "127.0.0.1", "0.0.0.0", "::1"}:
        return True
    return lowered.endswith(".local") or lowered.endswith(".internal")


def _ip_blocked(addr: str) -> bool:
    try:
        ip = ipaddress.ip_address(addr)
    except ValueError:
        return True
    return ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved


def validate_public_http_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        msg = "Povolené jsou pouze adresy URL http(s)."
        raise EmbedFetchError(msg)
    host = parsed.hostname
    if not host or _hostname_blocked(host):
        msg = "Hostitel adresy URL není povolen."
        raise EmbedFetchError(msg)
    try:
        resolved = socket.getaddrinfo(host, None)
    except OSError as exc:
        raise EmbedFetchError("Hostitele se nepodařilo přeložit.") from exc
    for entry in resolved:
        if _ip_blocked(entry[4][0]):
            msg = "Hostitel adresy URL není povolen."
            raise EmbedFetchError(msg)
    return url


def _headers_from_response(resp) -> dict[str, str]:
    return {k.lower(): v for k, v in resp.headers.items()}


def fetch_framing_headers(url: str) -> tuple[str, dict[str, str]]:
    validate_public_http_url(url)
    request = Request(url, method="HEAD", headers={"User-Agent": _USER_AGENT})
    try:
        with urlopen(request, timeout=_TIMEOUT_SEC) as response:
            return response.url, _headers_from_response(response)
    except HTTPError as exc:
        if exc.code not in {405, 501}:
            return exc.url, _headers_from_response(exc)
    except URLError as exc:
        raise EmbedFetchError("Adresu URL se nepodařilo kontaktovat.") from exc

    get_request = Request(url, method="GET", headers={"User-Agent": _USER_AGENT})
    try:
        with urlopen(get_request, timeout=_TIMEOUT_SEC) as response:
            return response.url, _headers_from_response(response)
    except HTTPError as exc:
        return exc.url, _headers_from_response(exc)
    except URLError as exc:
        raise EmbedFetchError("Adresu URL se nepodařilo kontaktovat.") from exc
