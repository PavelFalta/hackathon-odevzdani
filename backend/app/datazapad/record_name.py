from typing import Any

# First non-empty extra value wins (column_key form).
NAME_EXTRA_PRIORITY: tuple[str, ...] = (
    "název_projektu",
    "nazev_projektu",
    "název_spolecnosti",
    "nazev_spolecnosti",
    "obchodní_název",
    "obchodni_nazev",
    "název_koupacího_místa",
    "název_organizace",
    "provozovatel",
    "název",
    "nazev",
)


def resolve_record_name(name: str | None, extra: dict[str, Any]) -> str | None:
    if name and name.strip():
        return name.strip()
    for key in NAME_EXTRA_PRIORITY:
        value = extra.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return None
