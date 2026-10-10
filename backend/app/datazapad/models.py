from typing import Any

from pydantic import BaseModel, Field


class NormalizedRecord(BaseModel):
    """One row from a datazapad dataset, ready for Geo + vector indexing."""

    dataset_slug: str
    dataset_name: str
    source_file: str
    geometry_type: str
    source_object_id: str | None = None
    name: str | None = None
    lon: float | None = None
    lat: float | None = None
    geometry_wkt: str | None = None
    obec_kod: str | None = None
    obec_nazev: str | None = None
    okres_kod: str | None = None
    okres_nazev: str | None = None
    vusc_kod: str | None = None
    vusc_nazev: str | None = None
    orp_kod: str | None = None
    orp_nazev: str | None = None
    ulice: str | None = None
    cislo_domovni: str | None = None
    cislo_orientacni: str | None = None
    psc: str | None = None
    ico: str | None = None
    pravni_forma: str | None = None
    sidlo: str | None = None
    kod_adresy: str | None = None
    datovka: str | None = None
    email: str | None = None
    phone: str | None = None
    web: str | None = None
    extra: dict[str, Any] = Field(default_factory=dict)
    search_document: str = ""
