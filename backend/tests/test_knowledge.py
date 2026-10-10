import json

import pytest
from app.knowledge.embedder import HashEmbedder
from app.knowledge.ingest import ingest_normalized_dir, verify_knowledge_dir
from app.knowledge.models import KnowledgeSearchRequest
from app.knowledge.service import get_embedder, get_knowledge_store
from app.services.knowledge_search import search_knowledge


def test_knowledge_search_semantic(knowledge_dir):
    hits, total = search_knowledge(KnowledgeSearchRequest(query="knihovna Karlovy Vary", limit=3))
    assert total == 3
    assert hits
    names = {hit.record["name"] for hit in hits}
    assert "Knihovna Karlovy Vary" in names


def test_knowledge_search_bbox(knowledge_dir):
    hits, _ = search_knowledge(
        KnowledgeSearchRequest(
            query="kraj",
            limit=5,
            min_lon=12.8,
            max_lon=13.1,
            min_lat=50.15,
            max_lat=50.25,
        )
    )
    names = {hit.record["name"] for hit in hits}
    assert "Knihovna Karlovy Vary" in names
    assert "Zoo record" not in names


def test_full_corpus_ingest_hash():
    from pathlib import Path

    root = Path(__file__).resolve().parents[2]
    normalized = root / "datazapad" / "normalized"
    if not (normalized / "_manifest.json").is_file():
        pytest.skip("normalized corpus missing; run npm run datazapad:normalize")
    manifest = json.loads((normalized / "_manifest.json").read_text(encoding="utf-8"))
    expected = manifest["total_records"]
    out = root / "datazapad" / ".knowledge-test-hash"
    ingest_normalized_dir(normalized, out, HashEmbedder(128))
    report = verify_knowledge_dir(out, expected_count=expected)
    assert report["ok"]


def test_store_loaded(knowledge_dir):
    store = get_knowledge_store()
    assert store is not None
    assert store.ready
    assert get_embedder().dimension == 64
