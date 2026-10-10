import json
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import faiss
import numpy as np

from app.knowledge.embedder import Embedder
from app.knowledge.geo import haversine_km, in_bbox
from app.knowledge.models import KnowledgeHit


def _normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return vectors / norms


@dataclass
class KnowledgeStore:
    index: faiss.Index
    records: list[dict[str, Any]]
    embedder_name: str
    built_at: str
    index_path: Path

    @property
    def ready(self) -> bool:
        return self.index.ntotal > 0 and len(self.records) == self.index.ntotal

    def search(
        self,
        embedder: Embedder,
        query: str,
        limit: int,
        *,
        min_lon: float | None = None,
        min_lat: float | None = None,
        max_lon: float | None = None,
        max_lat: float | None = None,
        near_lon: float | None = None,
        near_lat: float | None = None,
        radius_km: float | None = None,
    ) -> list[KnowledgeHit]:
        if not self.ready:
            return []
        vector = _normalize(embedder.encode([query]))
        overfetch = min(self.index.ntotal, max(limit * 8, limit))
        scores, ids = self.index.search(vector, overfetch)
        hits: list[KnowledgeHit] = []
        has_bbox = any(v is not None for v in (min_lon, min_lat, max_lon, max_lat))
        has_radius = near_lon is not None and near_lat is not None and radius_km is not None

        for score, idx in zip(scores[0], ids[0], strict=True):
            if idx < 0:
                continue
            record = self.records[int(idx)]
            lon, lat = record.get("lon"), record.get("lat")
            if has_bbox and not in_bbox(lon, lat, min_lon, min_lat, max_lon, max_lat):
                continue
            if has_radius:
                if lon is None or lat is None:
                    continue
                if haversine_km(near_lon, near_lat, lon, lat) > radius_km:
                    continue
            hits.append(KnowledgeHit(score=float(score), record=record))
            if len(hits) >= limit:
                break
        return hits


def save_store(
    path: Path,
    index: faiss.Index,
    records: list[dict[str, Any]],
    embedder_name: str,
) -> None:
    path.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(path / "index.faiss"))
    records_path = path / "records.jsonl"
    with records_path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False))
            handle.write("\n")
    meta = {
        "embedder": embedder_name,
        "built_at": datetime.now(UTC).isoformat(),
        "record_count": len(records),
    }
    (path / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")


def load_store(path: Path) -> KnowledgeStore | None:
    index_file = path / "index.faiss"
    records_file = path / "records.jsonl"
    meta_file = path / "meta.json"
    if not index_file.is_file() or not records_file.is_file():
        return None
    index = faiss.read_index(str(index_file))
    records: list[dict[str, Any]] = []
    with records_file.open(encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                records.append(json.loads(line))
    meta = json.loads(meta_file.read_text(encoding="utf-8")) if meta_file.is_file() else {}
    return KnowledgeStore(
        index=index,
        records=records,
        embedder_name=meta.get("embedder", "unknown"),
        built_at=meta.get("built_at", ""),
        index_path=path,
    )
