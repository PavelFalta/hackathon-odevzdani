#!/usr/bin/env python3
"""Build FAISS index from normalized datazapad JSONL."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.config import settings  # noqa: E402
from app.datazapad.pipeline import normalize_all  # noqa: E402
from app.knowledge.embedder import build_embedder  # noqa: E402
from app.knowledge.ingest import ingest_normalized_dir, verify_knowledge_dir  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=ROOT / "datazapad",
    )
    parser.add_argument(
        "--normalized-dir",
        type=Path,
        default=ROOT / "datazapad" / "normalized",
    )
    parser.add_argument(
        "--knowledge-dir",
        type=Path,
        default=ROOT / "datazapad" / "knowledge",
    )
    parser.add_argument(
        "--embedder",
        choices=("openai", "hash"),
        default=None,
        help="Override settings.knowledge_embedder",
    )
    parser.add_argument(
        "--skip-normalize",
        action="store_true",
        help="Use existing normalized JSONL only",
    )
    args = parser.parse_args()

    if not args.skip_normalize:
        manifest = normalize_all(args.data_dir, args.normalized_dir)
        expected = manifest["total_records"]
    else:
        manifest_path = args.normalized_dir / "_manifest.json"
        expected = json.loads(manifest_path.read_text(encoding="utf-8"))["total_records"]

    backend = args.embedder or settings.knowledge_embedder
    embedder = build_embedder(
        backend,
        openai_api_key=settings.openai_api_key,
        embedding_model=settings.embedding_model,
        hash_dimension=settings.knowledge_hash_dimension,
    )
    summary = ingest_normalized_dir(args.normalized_dir, args.knowledge_dir, embedder)
    report = verify_knowledge_dir(args.knowledge_dir, expected_count=expected)
    if not report["ok"]:
        print(json.dumps({"summary": summary, "verify": report}, indent=2), file=sys.stderr)
        return 1
    print(json.dumps({"summary": summary, "verify": report}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
