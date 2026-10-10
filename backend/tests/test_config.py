from app.config import Settings


def test_database_url_normalizes_railway_postgres() -> None:
    settings = Settings(database_url="postgresql://u:p@host:5432/railway")
    assert settings.database_url == "postgresql+psycopg://u:p@host:5432/railway"


def test_database_url_keeps_psycopg_driver() -> None:
    url = "postgresql+psycopg://kairos:kairos@localhost:5432/kairos"
    assert Settings(database_url=url).database_url == url
