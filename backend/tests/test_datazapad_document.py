from app.datazapad.document import build_search_document
from app.datazapad.models import NormalizedRecord
from app.datazapad.record_name import resolve_record_name


def test_resolve_name_from_project_extra() -> None:
    name = resolve_record_name(
        None,
        {"název_projektu": "Digitální dílna", "název_spolecnosti": "Firma s.r.o."},
    )
    assert name == "Digitální dílna"


def test_search_document_includes_id_and_entity_first() -> None:
    record = NormalizedRecord(
        dataset_slug="startovaci-vouchery",
        dataset_name="Startovací vouchery 2024",
        source_file="v.csv",
        geometry_type="point",
        source_object_id="42",
        name="Digitální dílna",
        obec_nazev="Cheb",
        extra={"udeleny_financni_prispevek": "50000"},
    )
    doc = build_search_document(record)
    assert doc.startswith("Digitální dílna")
    assert "ID: 42" in doc
    assert "udeleny_financni_prispevek" in doc
    assert doc.index("Startovací vouchery") > doc.index("Digitální dílna")
