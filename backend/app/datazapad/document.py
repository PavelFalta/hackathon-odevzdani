from app.datazapad.models import NormalizedRecord
from app.datazapad.record_name import resolve_record_name

_MAX_DOC = 8000
_MAX_EXTRA_LINES = 24

# Extra keys likely to help search / RAG (substring match on column_key).
_EXTRA_SIGNAL = (
    "popis",
    "typ",
    "kategorie",
    "projekt",
    "voucher",
    "financ",
    "pozn",
    "informac",
    "provoz",
    "služb",
    "sluzb",
    "atraktiv",
    "památk",
    "pamatk",
    "číslo_zastávky",
    "cislo_zastavky",
)

_SKIP_EXTRA_PREFIX = (
    "geometry",
    "zeměpisná",
    "zemepisna",
    "zápis_vektor",
    "zapis_vektor",
)


def _join(parts: list[str]) -> str:
    text = " ".join(p for p in parts if p and p.strip())
    return text[:_MAX_DOC]


def _location_line(record: NormalizedRecord) -> str:
    bits = [
        record.ulice,
        record.cislo_domovni,
        record.psc,
        record.obec_nazev,
        record.okres_nazev,
    ]
    line = ", ".join(str(b) for b in bits if b)
    return f"Adresa: {line}" if line else ""


def _extra_lines(record: NormalizedRecord) -> list[str]:
    lines: list[str] = []
    canonical_text = {
        record.name,
        record.web,
        record.email,
        record.phone,
        record.sidlo,
        record.dataset_name,
    }
    for key in sorted(record.extra):
        if any(key.startswith(prefix) for prefix in _SKIP_EXTRA_PREFIX):
            continue
        raw = record.extra[key]
        if raw is None or not str(raw).strip():
            continue
        text = str(raw).strip()
        if text in canonical_text:
            continue
        signal = any(token in key for token in _EXTRA_SIGNAL)
        if signal or len(lines) < _MAX_EXTRA_LINES:
            lines.append(f"{key}: {text}")
    return lines


def build_search_document(record: NormalizedRecord) -> str:
    title = resolve_record_name(record.name, record.extra) or record.dataset_name
    head = [
        title,
        _location_line(record),
        record.sidlo or "",
        record.web or "",
        record.email or "",
        record.phone or "",
    ]
    body = _extra_lines(record)
    tail = [
        f"Zdroj: {record.dataset_name}",
        f"Vrstva: {record.dataset_slug}",
    ]
    if record.source_object_id:
        tail.append(f"ID: {record.source_object_id}")
    return _join([*head, *body, *tail])
