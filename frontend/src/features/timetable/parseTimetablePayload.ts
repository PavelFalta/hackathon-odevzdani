import type { TimetableBoard, TimetableDay, TimetableEvent } from './timetableTypes'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MAX_DAYS = 7
const MAX_EVENTS = 8

export function parseTimetablePayload(raw: string): TimetableBoard | { error: string } {
  let parsed: { title?: unknown; days?: unknown }
  try {
    parsed = JSON.parse(raw) as { title?: unknown; days?: unknown }
  } catch {
    return { error: 'invalid_arguments' }
  }
  if (!Array.isArray(parsed.days)) return { error: 'days_required' }
  const days = parsed.days
    .map(parseDay)
    .filter((day): day is TimetableDay => day !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_DAYS)
  if (!days.length) return { error: 'no_events' }
  const title = typeof parsed.title === 'string' ? parsed.title.trim() : ''
  return { title: title || 'Program', days }
}

function parseDay(value: unknown): TimetableDay | null {
  if (!value || typeof value !== 'object') return null
  const day = value as { date?: unknown; label?: unknown; events?: unknown }
  const date = typeof day.date === 'string' ? day.date.trim() : ''
  if (!DATE_RE.test(date) || !Array.isArray(day.events)) return null
  const events = day.events
    .map(parseEvent)
    .filter((event): event is TimetableEvent => event !== null)
    .slice(0, MAX_EVENTS)
  if (!events.length) return null
  const label = typeof day.label === 'string' ? day.label.trim() : ''
  return { date, label: label || date, events }
}

function parseEvent(value: unknown): TimetableEvent | null {
  if (!value || typeof value !== 'object') return null
  const event = value as { time?: unknown; title?: unknown; place?: unknown; url?: unknown }
  const title = typeof event.title === 'string' ? event.title.trim() : ''
  if (!title) return null
  const time = typeof event.time === 'string' ? event.time.trim() : ''
  const place = typeof event.place === 'string' ? event.place.trim() : ''
  const url = typeof event.url === 'string' ? event.url.trim() : ''
  return {
    time: time || null,
    title,
    place: place || null,
    url: url.startsWith('http') ? url : null,
  }
}
