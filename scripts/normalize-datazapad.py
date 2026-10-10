#!/usr/bin/env python3
"""Normalize datazapad CSVs into JSONL for map queries and vector indexing."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.datazapad.pipeline import normalize_all  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=ROOT / "datazapad",
        help="Directory with _katalog.csv and source CSVs",
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=ROOT / "datazapad" / "normalized",
        help="Output directory for JSONL and metadata",
    )
    args = parser.parse_args()
    manifest = normalize_all(args.data_dir, args.out_dir)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
