from functools import lru_cache

from app.config import settings
from app.knowledge.embedder import Embedder, build_embedder
from app.knowledge.store import KnowledgeStore, load_store

_store: KnowledgeStore | None = None
_store_key: str | None = None


@lru_cache
def get_embedder() -> Embedder:
    return build_embedder(
        settings.knowledge_embedder,
        openai_api_key=settings.openai_api_key,
        embedding_model=settings.embedding_model,
        hash_dimension=settings.knowledge_hash_dimension,
    )


def get_knowledge_store() -> KnowledgeStore | None:
    global _store, _store_key
    path = settings.repo_path(settings.knowledge_dir)
    key = str(path.resolve())
    if _store is not None and _store_key == key:
        return _store
    _store = load_store(path)
    _store_key = key
    return _store


def reset_knowledge_cache() -> None:
    global _store, _store_key
    _store = None
    _store_key = None
    get_embedder.cache_clear()


def try_get_embedder_name() -> str | None:
    try:
        return get_embedder().name
    except ValueError:
        return None
