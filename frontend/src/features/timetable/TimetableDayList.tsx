import { TimetableEventRow } from './TimetableEventRow'
import type { TimetableDay } from './timetableTypes'

export function TimetableDayList({ days }: { days: TimetableDay[] }) {
  return (
    <div className="timetable-panel__body kairos-scroll">
      {days.map((day) => (
        <section key={day.date} className="timetable-panel__day">
          <h3 className="timetable-panel__day-label">
            {day.label}
            <span>{day.date}</span>
          </h3>
          <ul className="timetable-panel__events">
            {day.events.map((event) => (
              <TimetableEventRow key={`${day.date}-${event.time}-${event.title}`} event={event} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
