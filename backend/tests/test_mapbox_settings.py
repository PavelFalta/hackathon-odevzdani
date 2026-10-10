from importlib import reload

from app import config as config_module


def test_mapbox_token_falls_back_to_vite_env(monkeypatch) -> None:
    monkeypatch.delenv("MAPBOX_ACCESS_TOKEN", raising=False)
    monkeypatch.setenv("VITE_MAPBOX_TOKEN", "pk.test-fallback")
    reload(config_module)
    assert config_module.settings.mapbox_access_token == "pk.test-fallback"
    reload(config_module)
