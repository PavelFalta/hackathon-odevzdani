import csv
import json
import sys
from pathlib import Path
from typing import Any

from app.datazapad.aliases import canonical_field_for_column
from app.datazapad.catalog import DatasetCatalogEntry, load_catalog
from app.datazapad.column_keys import column_key
from app.datazapad.models import NormalizedRecord
from app.datazapad.normalize_row import normalize_row


def _column_map(headers: list[str]) -> dict[str, dict[str, str | None]]:
    mapping: dict[str, dict[str, str | None]] = {}
    for header in headers:
        key = column_key(header)
        mapping[header] = {
            "extra_key": key,
            "canonical": canonical_field_for_column(header),
        }
    return mapping


def normalize_dataset(
    data_dir: Path,
    entry: DatasetCatalogEntry,
) -> tuple[list[NormalizedRecord], dict[str, dict[str, str | None]]]:
    csv.field_size_limit(sys.maxsize)
    path = data_dir / entry.filename
    records: list[NormalizedRecord] = []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = list(reader.fieldnames or [])
        colmap = _column_map(headers)
        for row in reader:
            records.append(normalize_row(row, headers, entry))
    return records, colmap


def normalize_all(data_dir: Path, out_dir: Path) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    catalog = load_catalog(data_dir)
    manifest: dict[str, Any] = {"datasets": [], "total_records": 0}

    for entry in catalog:
        records, colmap = normalize_dataset(data_dir, entry)
        out_path = out_dir / f"{entry.slug}.jsonl"
        with out_path.open("w", encoding="utf-8") as handle:
            for record in records:
                handle.write(record.model_dump_json())
                handle.write("\n")

        map_path = out_dir / "column_maps" / f"{entry.slug}.json"
        map_path.parent.mkdir(parents=True, exist_ok=True)
        map_path.write_text(json.dumps(colmap, ensure_ascii=False, indent=2), encoding="utf-8")

        with_coords = sum(1 for r in records if r.lon is not None and r.lat is not None)
        manifest["datasets"].append(
            {
                "slug": entry.slug,
                "name": entry.name,
                "source_file": entry.filename,
                "geometry_type": entry.geometry_type,
                "records": len(records),
                "records_with_coordinates": with_coords,
                "output": out_path.name,
            }
        )
        manifest["total_records"] += len(records)

    schema_path = out_dir / "_schema.json"
    schema_path.write_text(
        json.dumps(NormalizedRecord.model_json_schema(), indent=2),
        encoding="utf-8",
    )
    manifest_path = out_dir / "_manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest
