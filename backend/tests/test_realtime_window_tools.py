from app.services.realtime_tools import KAIROS_REALTIME_INSTRUCTIONS
from app.services.realtime_window_tools import WINDOW_TURN_HOUSEKEEPING


def test_realtime_instructions_include_window_turn_housekeeping() -> None:
    assert WINDOW_TURN_HOUSEKEEPING in KAIROS_REALTIME_INSTRUCTIONS
    assert "list_open_windows" in WINDOW_TURN_HOUSEKEEPING
