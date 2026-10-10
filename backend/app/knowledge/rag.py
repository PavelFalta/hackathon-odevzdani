from typing import Any

from pydantic import BaseModel, Field

from app.datazapad.record_name import resolve_record_name


class RagChunk(BaseModel):
    chunk_id: str
    citation: str
    text: str
    score: float
    metadata: dict[str, Any] = Field(default_factory=dict)


def record_chunk_id(record: dict[str, Any]) -> str:
    slug = record.get("dataset_slug") or "record"
    oid = record.get("source_object_id") or "?"
    return f"{slug}:{oid}"


def _lines_for_llm(record: dict[str, Any]) -> list[str]:
    title = resolve_record_name(record.get("name"), record.get("extra") or {}) or record.get(
        "dataset_name", "Záznam"
    )
    lines = [title, f"Datová sada: {record.get('dataset_name', '')}"]
    place = record.get("obec_nazev") or record.get("okres_nazev")
    if place:
        lines.append(f"Území: {place}")
    if record.get("ulice") or record.get("psc"):
        lines.append(
            "Adresa: "
            + ", ".join(
                str(x)
                for x in (record.get("ulice"), record.get("cislo_domovni"), record.get("psc"))
                if x
            )
        )
    if record.get("lon") is not None and record.get("lat") is not None:
        lines.append(f"Souřadnice (WGS84): {record['lon']}, {record['lat']}")
    for key in ("web", "email", "phone"):
        if record.get(key):
            lines.append(f"{key}: {record[key]}")
    doc = (record.get("search_document") or "").strip()
    if doc:
        lines.append(doc)
    return lines


def hit_to_rag_chunk(record: dict[str, Any], score: float) -> RagChunk:
    title = resolve_record_name(record.get("name"), record.get("extra") or {}) or record.get(
        "dataset_name", "Záznam"
    )
    text = "\n".join(_lines_for_llm(record))
    metadata = {
        "dataset_slug": record.get("dataset_slug"),
        "dataset_name": record.get("dataset_name"),
        "name": title,
        "lon": record.get("lon"),
        "lat": record.get("lat"),
        "web": record.get("web"),
        "geometry_type": record.get("geometry_type"),
    }
    return RagChunk(
        chunk_id=record_chunk_id(record),
        citation=title,
        text=text,
        score=score,
        metadata=metadata,
    )


def format_rag_context(chunks: list[RagChunk]) -> str:
    blocks: list[str] = []
    for index, chunk in enumerate(chunks, start=1):
        header = f"[{index}] {chunk.citation} (id={chunk.chunk_id}, score={chunk.score:.3f})"
        blocks.append(f"{header}\n{chunk.text}")
    return "\n\n".join(blocks)
