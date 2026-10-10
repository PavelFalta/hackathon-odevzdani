import json
import os

os.environ["DATABASE_URL"] = "sqlite:////tmp/kairos_pytest.db"

import pytest
from app.config import settings
from app.datazapad.models import NormalizedRecord
from app.knowledge.embedder import HashEmbedder
from app.knowledge.ingest import ingest_normalized_dir, verify_knowledge_dir
from app.knowledge.service import reset_knowledge_cache
from app.db.bootstrap import reset_database_for_tests
from app.main import app
from fastapi.testclient import TestClient

reset_database_for_tests()


def _sample_record(name: str, lon: float, lat: float, slug: str) -> dict:
    record = NormalizedRecord(
        dataset_slug=slug,
        dataset_name="Test layer",
        source_file="test.csv",
        geometry_type="point",
        name=name,
        lon=lon,
        lat=lat,
        search_document=f"{name} Karlovarský kraj",
    )
    return record.model_dump()


@pytest.fixture
def knowledge_dir(tmp_path, monkeypatch):
    normalized = tmp_path / "normalized"
    normalized.mkdir()
    records = [
        _sample_record("Rozhledna Doupov", 13.0, 50.2, "rozhledny"),
        _sample_record("Knihovna Karlovy Vary", 12.87, 50.23, "knihovny"),
        _sample_record("Zoo record", 12.5, 50.1, "zoo"),
    ]
    with (normalized / "test.jsonl").open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False))
            handle.write("\n")

    out = tmp_path / "knowledge"
    ingest_normalized_dir(normalized, out, HashEmbedder(64))
    report = verify_knowledge_dir(out, expected_count=3)
    assert report["ok"]

    monkeypatch.setattr(settings, "knowledge_dir", str(out))
    monkeypatch.setattr(settings, "knowledge_embedder", "hash")
    monkeypatch.setattr(settings, "knowledge_hash_dimension", 64)
    reset_knowledge_cache()
    yield out
    reset_knowledge_cache()


@pytest.fixture
def client() -> TestClient:
    reset_database_for_tests()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": "demo", "password": "demo123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
