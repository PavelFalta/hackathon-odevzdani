from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta

from app.db.models import UsageEvent


@dataclass(frozen=True)
class UsageMetrics:
    tool_calls: int
    mapbox_calls: int
    openai_events: int
    input_tokens: int
    output_tokens: int
    event_count: int


def empty_metrics() -> UsageMetrics:
    return UsageMetrics(0, 0, 0, 0, 0, 0)


def metrics_from_events(events: list[UsageEvent]) -> UsageMetrics:
    tool_calls = sum(1 for row in events if row.category == "tool")
    mapbox_calls = sum(1 for row in events if row.category == "mapbox")
    openai_events = sum(row.quantity for row in events if row.category == "openai_realtime")
    input_tokens = sum(row.input_tokens or 0 for row in events)
    output_tokens = sum(row.output_tokens or 0 for row in events)
    return UsageMetrics(
        tool_calls=tool_calls,
        mapbox_calls=mapbox_calls,
        openai_events=openai_events,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        event_count=len(events),
    )


def metrics_to_dict(metrics: UsageMetrics) -> dict[str, int]:
    return {
        "tool_calls": metrics.tool_calls,
        "mapbox_calls": metrics.mapbox_calls,
        "openai_events": metrics.openai_events,
        "input_tokens": metrics.input_tokens,
        "output_tokens": metrics.output_tokens,
        "event_count": metrics.event_count,
    }


def daily_buckets(start: datetime, end: datetime) -> list[date]:
    days: list[date] = []
    current = start.date()
    last = end.date()
    while current <= last:
        days.append(current)
        current += timedelta(days=1)
    return days


def daily_series(
    events: list[UsageEvent],
    start: datetime,
    end: datetime,
) -> list[dict[str, object]]:
    by_day: dict[date, list[UsageEvent]] = defaultdict(list)
    for event in events:
        day = event.occurred_at.astimezone(UTC).date()
        by_day[day].append(event)

    series: list[dict[str, object]] = []
    for day in daily_buckets(start, end):
        metrics = metrics_from_events(by_day.get(day, []))
        series.append({"date": day.isoformat(), **metrics_to_dict(metrics)})
    return series


def category_breakdown(events: list[UsageEvent]) -> list[dict[str, object]]:
    counts: dict[str, int] = defaultdict(int)
    for row in events:
        if row.category == "openai_realtime":
            counts[row.category] += row.quantity
        else:
            counts[row.category] += 1
    return [
        {"category": key, "count": value}
        for key, value in sorted(counts.items(), key=lambda x: -x[1])
    ]


def top_tool_labels(events: list[UsageEvent], limit: int = 12) -> list[dict[str, object]]:
    counts: dict[str, int] = defaultdict(int)
    for row in events:
        if row.category != "tool":
            continue
        counts[row.label] += 1
    ranked = sorted(counts.items(), key=lambda item: -item[1])[:limit]
    return [{"label": label, "count": count} for label, count in ranked]
