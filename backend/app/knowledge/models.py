from typing import Any

from pydantic import BaseModel, Field


class KnowledgeHit(BaseModel):
    score: float
    record: dict[str, Any]


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=8, ge=1, le=50)
    min_lon: float | None = None
    min_lat: float | None = None
    max_lon: float | None = None
    max_lat: float | None = None
    near_lon: float | None = None
    near_lat: float | None = None
    radius_km: float | None = Field(default=None, gt=0, le=200)


class KnowledgeSearchResponse(BaseModel):
    hits: list[KnowledgeHit]
    total_indexed: int
    context: str | None = None


class KnowledgeStatusResponse(BaseModel):
    ready: bool
    total_indexed: int
    index_path: str | None
    embedder: str | None
    query_embedder: str | None = None
    embedder_match: bool = False
    built_at: str | None
