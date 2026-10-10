from app.knowledge.rag import RagChunk
from app.services.map_context_geo import search_request_with_map
from app.services.rag_retrieval import retrieve_rag_context


def _source_from_chunk(chunk: RagChunk) -> dict:
    return {
        "chunk_id": chunk.chunk_id,
        "citation": chunk.citation,
        "score": chunk.score,
        "text": chunk.text,
        **chunk.metadata,
    }


def answer_with_knowledge(
    user_message: str,
    limit: int = 6,
    map_context: dict | None = None,
) -> tuple[str, list[dict], str | None]:
    request = search_request_with_map(user_message, limit, map_context)
    context, chunks, total, error = retrieve_rag_context(request)
    if error:
        return error, [], None
    if total == 0:
        return (
            "Knowledge base is not built yet. Run `npm run knowledge:build` from the repo root.",
            [],
            None,
        )
    if not chunks:
        return (
            f"No matching records in the knowledge base ({total} indexed). Try a different query.",
            [],
            None,
        )
    lines = [f"Found {len(chunks)} relevant records (index size {total}):"]
    for chunk in chunks:
        place = chunk.metadata.get("name") or chunk.citation
        lines.append(f"- {place} (score {chunk.score:.3f})")
    sources = [_source_from_chunk(c) for c in chunks]
    return "\n".join(lines), sources, context
