import hashlib
from typing import Protocol

import numpy as np

from app.knowledge.openai_embedder import OpenAIEmbedder


class Embedder(Protocol):
    dimension: int
    name: str

    def encode(self, texts: list[str]) -> np.ndarray: ...


class HashEmbedder:
    """Deterministic vectors for tests and offline ingest without API calls."""

    def __init__(self, dimension: int = 384) -> None:
        self.dimension = dimension
        self.name = f"hash-{dimension}"

    def encode(self, texts: list[str]) -> np.ndarray:
        rows = [self._one(text) for text in texts]
        return np.vstack(rows).astype(np.float32)

    def _one(self, text: str) -> np.ndarray:
        seed = hashlib.sha256(text.encode("utf-8")).digest()
        values = np.frombuffer(seed * ((self.dimension // len(seed)) + 1), dtype=np.uint8)
        values = values[: self.dimension].astype(np.float32)
        values = (values - 127.5) / 127.5
        norm = np.linalg.norm(values)
        if norm > 0:
            values /= norm
        return values


def build_embedder(
    backend: str,
    *,
    openai_api_key: str | None,
    embedding_model: str,
    hash_dimension: int = 384,
) -> Embedder:
    if backend == "openai":
        if not openai_api_key:
            msg = "OPENAI_API_KEY is required when KNOWLEDGE_EMBEDDER=openai"
            raise ValueError(msg)
        return OpenAIEmbedder(openai_api_key, embedding_model)
    if backend == "hash":
        return HashEmbedder(hash_dimension)
    msg = f"Unknown embedder backend: {backend} (use openai or hash)"
    raise ValueError(msg)
