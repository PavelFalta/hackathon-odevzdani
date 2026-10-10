from pathlib import Path

from app.datazapad.catalog import load_catalog
from app.datazapad.geometry import resolve_coordinates
from app.datazapad.normalize_row import normalize_row
from app.datazapad.pipeline import normalize_all

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "datazapad"


def test_resolve_coordinates_from_xy():
    row = {"x": "12.863648", "y": "50.374035", "geometry_wkt": ""}
    lon, lat = resolve_coordinates(row, ["x", "y", "geometry_wkt"])
    assert lon == 12.863648
    assert lat == 50.374035


def test_normalize_zoo_row_keeps_web_in_extra():
    entry = next(e for e in load_catalog(DATA) if e.slug.startswith("zoo-a-zooparky"))
    path = DATA / entry.filename
    import csv

    with path.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = list(reader.fieldnames or [])
        row = next(reader)
    record = normalize_row(row, headers, entry)
    assert record.name
    assert record.lon is not None and record.lat is not None
    assert record.web or any(k.startswith("web") for k in record.extra)
    assert record.search_document


def test_normalize_all_writes_manifest(tmp_path):
    out = tmp_path / "normalized"
    manifest = normalize_all(DATA, out)
    assert manifest["total_records"] > 0
    assert (out / "_manifest.json").is_file()
    first = manifest["datasets"][0]
    assert (out / first["output"]).is_file()
