import type { TimetableEvent } from './timetableTypes'

/** Google Places text search query for a timetable row. */
export function timetableEventReviewsQuery(event: TimetableEvent): string {
  const title = event.title.trim()
  const place = event.place?.trim() ?? ''
  if (!title && place) return place
  if (!place) return title
  if (title.toLowerCase().includes(place.toLowerCase())) return title
  return `${title} ${place}`
}
