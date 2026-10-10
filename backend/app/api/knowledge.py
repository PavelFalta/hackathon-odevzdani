from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.knowledge.models import (
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeStatusResponse,
)
from app.knowledge.rag import format_rag_context, hit_to_rag_chunk
from app.knowledge.service import get_knowledge_store, try_get_embedder_name
from app.services.knowledge_search import search_knowledge

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/status", response_model=KnowledgeStatusResponse)
async def knowledge_status(_user: str = Depends(get_current_user)) -> KnowledgeStatusResponse:
    store = get_knowledge_store()
    if store is None or not store.ready:
        return KnowledgeStatusResponse(
            ready=False,
            total_indexed=0,
            index_path=None,
            embedder=None,
            built_at=None,
        )
    active = try_get_embedder_name()
    return KnowledgeStatusResponse(
        ready=True,
        total_indexed=store.index.ntotal,
        index_path=str(store.index_path),
        embedder=store.embedder_name,
        query_embedder=active,
        embedder_match=active is not None and active == store.embedder_name,
        built_at=store.built_at,
    )


@router.post("/search", response_model=KnowledgeSearchResponse)
async def knowledge_search(
    body: KnowledgeSearchRequest,
    _user: str = Depends(get_current_user),
) -> KnowledgeSearchResponse:
    hits, total = search_knowledge(body)
    chunks = [hit_to_rag_chunk(hit.record, hit.score) for hit in hits]
    context = format_rag_context(chunks) if chunks else None
    return KnowledgeSearchResponse(hits=hits, total_indexed=total, context=context)
