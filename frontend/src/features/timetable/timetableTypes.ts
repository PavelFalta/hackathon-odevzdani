export type TimetableEvent = {
  time: string | null
  title: string
  place: string | null
  url: string | null
}

export type TimetableDay = {
  date: string
  label: string
  events: TimetableEvent[]
}

export type TimetableBoard = {
  title: string
  days: TimetableDay[]
}

export const TIMETABLE_WINDOW_ID = 'timetable'
