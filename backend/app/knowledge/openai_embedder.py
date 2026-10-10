import numpy as np
from openai import OpenAI

_BATCH_SIZE = 128


class OpenAIEmbedder:
    def __init__(self, api_key: str, model: str) -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model
        self.name = model
        probe = self._embed_batch(["probe"])
        self.dimension = int(probe.shape[1])

    def encode(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)
        batches: list[np.ndarray] = []
        for start in range(0, len(texts), _BATCH_SIZE):
            chunk = texts[start : start + _BATCH_SIZE]
            batches.append(self._embed_batch(chunk))
        return np.vstack(batches)

    def _embed_batch(self, texts: list[str]) -> np.ndarray:
        safe = [text if text.strip() else "." for text in texts]
        response = self._client.embeddings.create(input=safe, model=self._model)
        ordered = sorted(response.data, key=lambda row: row.index)
        rows = [row.embedding for row in ordered]
        return np.array(rows, dtype=np.float32)
