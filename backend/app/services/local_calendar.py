from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

PRAGUE = ZoneInfo("Europe/Prague")

_WEEKDAY_EN = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)
_SUNDAY = 6


def this_weekend(today: date) -> tuple[date, date]:
    weekday = today.weekday()
    saturday = today + timedelta(days=(5 - weekday) % 7)
    if weekday == _SUNDAY:
        saturday = today - timedelta(days=1)
    return saturday, saturday + timedelta(days=1)


def next_weekend(today: date) -> tuple[date, date]:
    start, _end = this_weekend(today)
    nxt = start + timedelta(days=7)
    return nxt, nxt + timedelta(days=1)


def calendar_prompt_block(now: datetime | None = None) -> str:
    local = now.astimezone(PRAGUE) if now else datetime.now(PRAGUE)
    today = local.date()
    tomorrow = today + timedelta(days=1)
    start, end = this_weekend(today)
    nxt, nxt_end = next_weekend(today)
    sunday_note = ""
    if today.weekday() == _SUNDAY:
        sunday_note = (
            " Today is Sunday, so Saturday of this weekend has already passed; "
            "prefer events still happening today unless the user asks about the whole weekend."
        )
    return (
        "Calendar (Europe/Prague, authoritative): "
        f"today is {today.isoformat()} ({_WEEKDAY_EN[today.weekday()]}). "
        f"Tomorrow is {tomorrow.isoformat()} ({_WEEKDAY_EN[tomorrow.weekday()]}). "
        f"This weekend is {start.isoformat()} ({_WEEKDAY_EN[start.weekday()]}) "
        f"through {end.isoformat()} ({_WEEKDAY_EN[end.weekday()]}). "
        f"Next weekend is {nxt.isoformat()} through {nxt_end.isoformat()}."
        f"{sunday_note} "
        "Resolve today, tomorrow, this weekend, and next weekend only from these dates."
    )
