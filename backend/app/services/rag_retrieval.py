from app.knowledge.models import KnowledgeSearchRequest
from app.knowledge.rag import RagChunk, format_rag_context, hit_to_rag_chunk
from app.services.knowledge_search import knowledge_operational_error, search_knowledge


def retrieve_rag_chunks(request: KnowledgeSearchRequest) -> tuple[list[RagChunk], int, str | None]:
    error = knowledge_operational_error()
    if error:
        return [], 0, error
    hits, total = search_knowledge(request)
    chunks = [hit_to_rag_chunk(hit.record, hit.score) for hit in hits]
    return chunks, total, None


def retrieve_rag_context(
    request: KnowledgeSearchRequest,
) -> tuple[str | None, list[RagChunk], int, str | None]:
    chunks, total, error = retrieve_rag_chunks(request)
    if error:
        return None, [], 0, error
    if not chunks:
        return None, [], total, None
    return format_rag_context(chunks), chunks, total, None
