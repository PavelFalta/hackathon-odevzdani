import os
from pathlib import Path

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://kairos:kairos@localhost:5432/kairos"
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:8080"]
    jwt_secret: str = "dev-only-change-in-docker-env"
    # RAG / LLM (wire up when you add retrieval)
    openai_api_key: str | None = None
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"
    web_search_model: str = "gpt-4.1-mini"
    realtime_model: str = "gpt-realtime-2.1"
    reviews_api_key: str | None = None
    mapbox_access_token: str | None = Field(
        default=None,
        validation_alias=AliasChoices("MAPBOX_ACCESS_TOKEN", "VITE_MAPBOX_TOKEN"),
    )
    knowledge_dir: str = "datazapad/knowledge"
    knowledge_embedder: str = "openai"
    knowledge_hash_dimension: int = 384

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_database_url(cls, value: str) -> str:
        if not isinstance(value, str):
            return value
        if value.startswith("postgres://"):
            return "postgresql+psycopg://" + value.removeprefix("postgres://")
        if value.startswith("postgresql://"):
            return "postgresql+psycopg://" + value.removeprefix("postgresql://")
        return value

    @field_validator("mapbox_access_token", mode="before")
    @classmethod
    def _strip_mapbox_token(cls, value: str | None) -> str | None:
        if value is None or not isinstance(value, str):
            return value
        stripped = value.strip()
        return stripped if stripped else None

    @model_validator(mode="after")
    def _mapbox_token_from_vite_env(self) -> "Settings":
        if self.mapbox_access_token:
            return self
        vite = os.environ.get("VITE_MAPBOX_TOKEN", "").strip()
        if vite:
            self.mapbox_access_token = vite
        return self

    def repo_path(self, relative: str) -> Path:
        path = Path(relative)
        if path.is_absolute():
            return path
        return _REPO_ROOT / path


settings = Settings()
