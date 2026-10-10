from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings

_connect_args: dict[str, object] = {}
_pool_kwargs: dict[str, object] = {}
if settings.database_url.startswith("sqlite"):
    _connect_args["check_same_thread"] = False
    if settings.database_url.rstrip("/") in {"sqlite://", "sqlite:///:memory:"}:
        _pool_kwargs["poolclass"] = StaticPool

engine = create_engine(settings.database_url, connect_args=_connect_args, **_pool_kwargs)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
