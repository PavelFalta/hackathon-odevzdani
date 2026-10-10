from datetime import UTC, date, datetime, timedelta
from typing import Literal

AdminPeriod = Literal["7d", "30d", "90d", "this_month", "last_month", "all", "custom"]


def _start_of_month(d: date) -> datetime:
    return datetime(d.year, d.month, 1, tzinfo=UTC)


def _end_of_day(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, 23, 59, 59, 999999, tzinfo=UTC)


def resolve_usage_range(
    *,
    period: AdminPeriod = "30d",
    from_date: date | None = None,
    to_date: date | None = None,
    now: datetime | None = None,
) -> tuple[datetime, datetime]:
    current = now or datetime.now(UTC)
    today = current.date()

    if period == "custom":
        if from_date is None or to_date is None:
            raise ValueError("custom period requires from and to dates")
        start = datetime(from_date.year, from_date.month, from_date.day, tzinfo=UTC)
        end = _end_of_day(to_date)
        if end < start:
            raise ValueError("to must be on or after from")
        return start, end

    if period == "all":
        epoch = datetime(1970, 1, 1, tzinfo=UTC)
        return epoch, current

    if period == "this_month":
        return _start_of_month(today), current

    if period == "last_month":
        first_this = _start_of_month(today)
        last_day_prev = first_this - timedelta(days=1)
        start = _start_of_month(last_day_prev.date())
        end = _end_of_day(last_day_prev.date())
        return start, end

    days = {"7d": 7, "30d": 30, "90d": 90}[period]
    start_day = today - timedelta(days=days - 1)
    start = datetime(start_day.year, start_day.month, start_day.day, tzinfo=UTC)
    return start, current
