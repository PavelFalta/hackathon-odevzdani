from app.knowledge.rag import format_rag_context, hit_to_rag_chunk, record_chunk_id


def test_record_chunk_id_stable() -> None:
    assert record_chunk_id({"dataset_slug": "zoo", "source_object_id": "7"}) == "zoo:7"


def test_hit_to_rag_chunk_and_context() -> None:
    record = {
        "dataset_slug": "rozhledny",
        "dataset_name": "Rozhledny",
        "source_object_id": "1",
        "name": "Diana",
        "lon": 12.8,
        "lat": 50.2,
        "search_document": "Diana rozhledna Karlovy Vary",
        "extra": {},
    }
    chunk = hit_to_rag_chunk(record, 0.91)
    assert chunk.chunk_id == "rozhledny:1"
    assert "Diana" in chunk.text
    context = format_rag_context([chunk])
    assert "[1]" in context
    assert "rozhledny:1" in context
