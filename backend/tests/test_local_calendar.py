from datetime import datetime
from zoneinfo import ZoneInfo

from app.services.local_calendar import calendar_prompt_block, this_weekend

PRAGUE = ZoneInfo("Europe/Prague")


def _at(day: int, hour: int = 12) -> datetime:
    return datetime(2026, 10, day, hour, tzinfo=PRAGUE)


def test_friday_weekend_is_the_coming_saturday() -> None:
    start, end = this_weekend(_at(9).date())
    text = calendar_prompt_block(_at(9))
    assert (start.isoformat(), end.isoformat()) == ("2026-10-10", "2026-10-11")
    assert "today is 2026-10-09 (Friday)" in text
    assert "This weekend is 2026-10-10 (Saturday) through 2026-10-11 (Sunday)" in text
    assert "Next weekend is 2026-10-17 through 2026-10-18" in text


def test_saturday_weekend_includes_today() -> None:
    text = calendar_prompt_block(_at(10))
    assert "today is 2026-10-10 (Saturday)" in text
    assert "This weekend is 2026-10-10 (Saturday) through 2026-10-11 (Sunday)" in text


def test_sunday_marks_saturday_as_already_past() -> None:
    text = calendar_prompt_block(_at(11))
    assert "today is 2026-10-11 (Sunday)" in text
    assert "Saturday of this weekend has already passed" in text
    assert "Next weekend is 2026-10-17 through 2026-10-18" in text


def test_monday_weekend_is_the_following_saturday() -> None:
    start, end = this_weekend(_at(12).date())
    assert (start.isoformat(), end.isoformat()) == ("2026-10-17", "2026-10-18")
