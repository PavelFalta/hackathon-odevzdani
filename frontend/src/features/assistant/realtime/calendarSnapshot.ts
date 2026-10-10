const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

type CivilDate = { year: number; month: number; day: number }

function pragueCivilDate(now: Date): CivilDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return { year: Number(value('year')), month: Number(value('month')), day: Number(value('day')) }
}

function utcDate(civil: CivilDate): Date {
  return new Date(Date.UTC(civil.year, civil.month - 1, civil.day))
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function thisWeekend(today: Date): [Date, Date] {
  const weekday = today.getUTCDay()
  const saturday = weekday === 0 ? addDays(today, -1) : addDays(today, (6 - weekday) % 7)
  return [saturday, addDays(saturday, 1)]
}

export function calendarSnapshotText(now = new Date()): string {
  const today = utcDate(pragueCivilDate(now))
  const tomorrow = addDays(today, 1)
  const [start, end] = thisWeekend(today)
  const nextStart = addDays(start, 7)
  const nextEnd = addDays(nextStart, 1)
  const weekday = (date: Date) => WEEKDAYS[(date.getUTCDay() + 6) % 7]
  const sundayNote =
    today.getUTCDay() === 0
      ? ' Today is Sunday, so Saturday of this weekend has already passed; prefer events still happening today unless the user asks about the whole weekend.'
      : ''
  return (
    `Calendar (Europe/Prague, authoritative): today is ${iso(today)} (${weekday(today)}). ` +
    `Tomorrow is ${iso(tomorrow)} (${weekday(tomorrow)}). ` +
    `This weekend is ${iso(start)} (${weekday(start)}) through ${iso(end)} (${weekday(end)}). ` +
    `Next weekend is ${iso(nextStart)} through ${iso(nextEnd)}.` +
    `${sundayNote} Resolve today, tomorrow, this weekend, and next weekend only from these dates.`
  )
}

export function calendarTurnContextEvent(now = new Date()): string {
  return JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text:
            `[App context — ${calendarSnapshotText(now)} ` +
            'Use this calendar before any date-sensitive search. Do not guess the date.]',
        },
      ],
    },
  })
}
