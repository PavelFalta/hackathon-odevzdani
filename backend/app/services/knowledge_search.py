from app.knowledge.models import KnowledgeHit, KnowledgeSearchRequest
from app.knowledge.service import get_embedder, get_knowledge_store, try_get_embedder_name


def knowledge_operational_error() -> str | None:
    store = get_knowledge_store()
    if store is None or not store.ready:
        return None
    active = try_get_embedder_name()
    if active is None:
        return "OPENAI_API_KEY is required when KNOWLEDGE_EMBEDDER=openai"
    if store.embedder_name != active:
        return (
            f"Index embedder is `{store.embedder_name}` but the API uses `{active}`. "
            "Rebuild with `npm run knowledge:build`."
        )
    return None


def search_knowledge(body: KnowledgeSearchRequest) -> tuple[list[KnowledgeHit], int]:
    store = get_knowledge_store()
    if store is None or not store.ready:
        return [], 0
    embedder = get_embedder()
    if store.embedder_name != embedder.name:
        return [], store.index.ntotal
    hits = store.search(
        embedder,
        body.query,
        body.limit,
        min_lon=body.min_lon,
        min_lat=body.min_lat,
        max_lon=body.max_lon,
        max_lat=body.max_lat,
        near_lon=body.near_lon,
        near_lat=body.near_lat,
        radius_km=body.radius_km,
    )
    return hits, store.index.ntotal
