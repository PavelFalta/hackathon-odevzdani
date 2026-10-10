import { useReviews } from '../reviews/ReviewsContext'
import type { TimetableEvent } from './timetableTypes'
import { timetableEventReviewsQuery } from './timetableEventReviewsQuery'

export function TimetableEventRow({ event }: { event: TimetableEvent }) {
  const reviews = useReviews()
  const query = timetableEventReviewsQuery(event)

  const openPlace = () => {
    if (!query) return
    reviews.openForQuery(query)
  }

  return (
    <li className="timetable-panel__event">
      <span className="timetable-panel__time">{event.time ?? '—'}</span>
      <div className="timetable-panel__event-copy">
        {query ? (
          <button type="button" className="timetable-panel__title-btn" onClick={openPlace}>
            {event.title}
          </button>
        ) : (
          <span className="timetable-panel__title">{event.title}</span>
        )}
        {event.place ? <span className="timetable-panel__place">{event.place}</span> : null}
      </div>
    </li>
  )
}
