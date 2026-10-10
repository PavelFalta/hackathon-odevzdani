import csv
from dataclasses import dataclass
from pathlib import Path

from app.datazapad.column_keys import slugify

ESRI_TO_GEOMETRY = {
    "esriGeometryPoint": "point",
    "esriGeometryPolygon": "polygon",
    "esriGeometryMultipoint": "multipoint",
}


@dataclass(frozen=True)
class DatasetCatalogEntry:
    name: str
    layer: str
    filename: str
    record_count: int
    geometry_type: str
    slug: str


def load_catalog(data_dir: Path) -> list[DatasetCatalogEntry]:
    path = data_dir / "_katalog.csv"
    entries: list[DatasetCatalogEntry] = []
    with path.open(encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            esri = row["typ_geometrie"].strip()
            geometry = ESRI_TO_GEOMETRY.get(esri, esri)
            name = row["nazev"].strip()
            filename = row["soubor"].strip()
            entries.append(
                DatasetCatalogEntry(
                    name=name,
                    layer=row["vrstva"].strip(),
                    filename=filename,
                    record_count=int(row["pocet_zaznamu"]),
                    geometry_type=geometry,
                    slug=slugify(name),
                )
            )
    return entries
