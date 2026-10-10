from app.config import settings
from app.knowledge.service import get_knowledge_store, reset_knowledge_cache, try_get_embedder_name
from app.services.knowledge_search import knowledge_operational_error


def test_embedder_mismatch_detected(knowledge_dir, monkeypatch) -> None:
    monkeypatch.setattr(settings, "knowledge_hash_dimension", 128)
    reset_knowledge_cache()
    store = get_knowledge_store()
    assert store is not None
    assert try_get_embedder_name() == "hash-128"
    assert store.embedder_name == "hash-64"
    assert knowledge_operational_error() is not None
    reset_knowledge_cache()
