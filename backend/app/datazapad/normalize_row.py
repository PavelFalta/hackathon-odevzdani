from typing import Any

from app.datazapad.aliases import canonical_field_for_column
from app.datazapad.catalog import DatasetCatalogEntry
from app.datazapad.column_keys import column_key
from app.datazapad.document import build_search_document
from app.datazapad.geometry import resolve_coordinates
from app.datazapad.models import NormalizedRecord
from app.datazapad.record_name import resolve_record_name


def _cell(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped else None


def _apply_canonical(record: dict[str, Any], field: str, value: str | None) -> None:
    if value is None:
        return
    current = record.get(field)
    if current is None or current == "":
        record[field] = value


def normalize_row(
    row: dict[str, str],
    headers: list[str],
    entry: DatasetCatalogEntry,
) -> NormalizedRecord:
    extra: dict[str, Any] = {}
    canonical: dict[str, Any] = {
        "dataset_slug": entry.slug,
        "dataset_name": entry.name,
        "source_file": entry.filename,
        "geometry_type": entry.geometry_type,
    }

    for header in headers:
        raw = _cell(row.get(header))
        key = column_key(header)
        extra[key] = raw
        field = canonical_field_for_column(header)
        if field and field not in ("lon", "lat"):
            _apply_canonical(canonical, field, raw)

    lon, lat = resolve_coordinates(row, headers)
    canonical["lon"] = lon
    canonical["lat"] = lat

    if canonical.get("source_object_id") is not None:
        canonical["source_object_id"] = str(canonical["source_object_id"])

    resolved_name = resolve_record_name(canonical.get("name"), extra)
    if resolved_name:
        canonical["name"] = resolved_name

    record = NormalizedRecord(**canonical, extra=extra)
    record.search_document = build_search_document(record)
    return record
