"""Parse framing headers to guess if a page can be embedded cross-origin."""


def resource_origin(url: str) -> str:
    from urllib.parse import urlparse

    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    host = parsed.hostname or ""
    port = parsed.port
    if port and not ((scheme == "http" and port == 80) or (scheme == "https" and port == 443)):
        return f"{scheme}://{host}:{port}"
    return f"{scheme}://{host}"


def x_frame_options_blocks(
    value: str | None,
    *,
    ancestor_origin: str,
    resource_origin: str,
) -> bool:
    if not value:
        return False
    directive = value.strip().upper()
    if directive == "DENY":
        return True
    if directive == "SAMEORIGIN":
        return ancestor_origin.rstrip("/") != resource_origin.rstrip("/")
    return False


def _csp_directive_value(csp: str, name: str) -> str | None:
    needle = name.lower()
    for part in csp.split(";"):
        part = part.strip()
        lowered = part.lower()
        if not lowered.startswith(needle):
            continue
        rest = part[len(name) :].strip() if lowered.startswith(name) else part.split(" ", 1)[-1]
        return rest.split(":", 1)[-1].strip() if rest.startswith(":") else rest
    return None


def frame_ancestors_blocks(
    csp: str | None,
    *,
    ancestor_origin: str,
    resource_origin: str,
) -> bool:
    if not csp:
        return False
    value = _csp_directive_value(csp, "frame-ancestors")
    if value is None:
        return False
    tokens = value.split()
    if not tokens:
        return False
    if "'none'" in tokens:
        return True
    if "*" in tokens:
        return False
    ancestor = ancestor_origin.rstrip("/")
    resource = resource_origin.rstrip("/")
    for token in tokens:
        if token == "'self'" and ancestor == resource:
            return False
        if token.startswith(("http://", "https://")) and token.rstrip("/") == ancestor:
            return False
    return True


def embed_blocked_reason(
    headers: dict[str, str],
    *,
    ancestor_origin: str,
    final_url: str,
) -> str | None:
    origin = resource_origin(final_url)
    xfo = headers.get("x-frame-options")
    if x_frame_options_blocks(xfo, ancestor_origin=ancestor_origin, resource_origin=origin):
        return "Tento web nepovoluje vložený náhled."
    csp = headers.get("content-security-policy")
    if frame_ancestors_blocks(csp, ancestor_origin=ancestor_origin, resource_origin=origin):
        return "Tento web blokuje vložení do jiných aplikací."
    return None
