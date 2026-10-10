import json
from pathlib import Path
from typing import Any

import faiss
import numpy as np

from app.datazapad.models import NormalizedRecord
from app.knowledge.embedder import Embedder
from app.knowledge.store import save_store


def _normalize_vectors(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return vectors / norms


def load_normalized_records(normalized_dir: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(normalized_dir.glob("*.jsonl")):
        with path.open(encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                records.append(NormalizedRecord.model_validate_json(line).model_dump())
    return records


def build_index(records: list[dict[str, Any]], embedder: Embedder) -> faiss.Index:
    texts = [
        (r.get("search_document") or r.get("name") or r.get("dataset_name") or "").strip()
        for r in records
    ]
    vectors = _normalize_vectors(embedder.encode(texts))
    index = faiss.IndexFlatIP(embedder.dimension)
    index.add(vectors)
    return index


def ingest_normalized_dir(
    normalized_dir: Path,
    knowledge_dir: Path,
    embedder: Embedder,
) -> dict[str, Any]:
    records = load_normalized_records(normalized_dir)
    if not records:
        msg = f"No records under {normalized_dir}"
        raise ValueError(msg)
    index = build_index(records, embedder)
    if index.ntotal != len(records):
        msg = f"FAISS count {index.ntotal} != records {len(records)}"
        raise RuntimeError(msg)
    save_store(knowledge_dir, index, records, embedder.name)
    return {
        "record_count": len(records),
        "embedder": embedder.name,
        "knowledge_dir": str(knowledge_dir),
    }


def verify_knowledge_dir(knowledge_dir: Path, expected_count: int | None = None) -> dict[str, Any]:
    meta_path = knowledge_dir / "meta.json"
    if not meta_path.is_file():
        raise FileNotFoundError(f"Missing {meta_path}")
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    index = faiss.read_index(str(knowledge_dir / "index.faiss"))
    jsonl_lines = sum(
        1 for line in (knowledge_dir / "records.jsonl").open(encoding="utf-8") if line.strip()
    )
    report = {
        "meta_count": meta.get("record_count"),
        "index_ntotal": index.ntotal,
        "jsonl_lines": jsonl_lines,
        "ok": index.ntotal == jsonl_lines == meta.get("record_count"),
    }
    if expected_count is not None:
        report["expected_count"] = expected_count
        report["ok"] = report["ok"] and index.ntotal == expected_count
    return report
