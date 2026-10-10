import pytest
from app.knowledge.embedder import build_embedder


def test_openai_embedder_requires_api_key() -> None:
    with pytest.raises(ValueError, match="OPENAI_API_KEY"):
        build_embedder(
            "openai",
            openai_api_key=None,
            embedding_model="text-embedding-3-small",
        )
