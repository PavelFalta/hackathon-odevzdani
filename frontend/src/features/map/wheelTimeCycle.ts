import { WHEEL_PRESET_ANGLE } from './lightPresetWheel'

const DAWN_MINUTES = 6 * 60
const MIDNIGHT_ANGLE = 0
const NIGHT_ANGLE = WHEEL_PRESET_ANGLE.night

/** Arc time anchors: morning → noon → evening → midnight (right base). */
const TIME_ANCHORS: { angle: number; minutes: number }[] = [
  { angle: WHEEL_PRESET_ANGLE.dawn, minutes: DAWN_MINUTES },
  { angle: WHEEL_PRESET_ANGLE.day, minutes: 12 * 60 },
  { angle: WHEEL_PRESET_ANGLE.dusk, minutes: 18 * 60 },
  { angle: NIGHT_ANGLE, minutes: 24 * 60 },
]

function minutesOnPostMidnightArc(angle: number): number {
  if (NIGHT_ANGLE === 0) return 0
  return (angle / NIGHT_ANGLE) * DAWN_MINUTES
}

function angleOnPostMidnightArc(minutes: number): number {
  const t = DAWN_MINUTES === 0 ? 0 : minutes / DAWN_MINUTES
  return MIDNIGHT_ANGLE + t * (NIGHT_ANGLE - MIDNIGHT_ANGLE)
}

export function formatWheelClock(totalMinutes: number): string {
  const day = 24 * 60
  const m = ((Math.round(totalMinutes) % day) + day) % day
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

export function minutesFromWheelAngle(angle: number): number {
  const a = Math.max(TIME_ANCHORS[0].angle, Math.min(MIDNIGHT_ANGLE, angle))
  if (a >= NIGHT_ANGLE && a <= MIDNIGHT_ANGLE) {
    return minutesOnPostMidnightArc(a)
  }
  for (let i = 0; i < TIME_ANCHORS.length - 1; i += 1) {
    const start = TIME_ANCHORS[i]
    const end = TIME_ANCHORS[i + 1]
    if (a >= start.angle && a <= end.angle) {
      const span = end.angle - start.angle
      const t = span === 0 ? 0 : (a - start.angle) / span
      return start.minutes + t * (end.minutes - start.minutes)
    }
  }
  return TIME_ANCHORS[0].minutes
}

export function wheelAngleFromMinutes(minutes: number): number {
  const day = 24 * 60
  const m = ((minutes % day) + day) % day
  if (m < DAWN_MINUTES) return angleOnPostMidnightArc(m)

  for (let i = 0; i < TIME_ANCHORS.length - 1; i += 1) {
    const start = TIME_ANCHORS[i]
    const end = TIME_ANCHORS[i + 1]
    if (m >= start.minutes && m <= end.minutes) {
      const span = end.minutes - start.minutes
      const t = span === 0 ? 0 : (m - start.minutes) / span
      return start.angle + t * (end.angle - start.angle)
    }
  }
  return TIME_ANCHORS[TIME_ANCHORS.length - 1].angle
}

export function localDayMinutes(at = new Date()): number {
  return at.getHours() * 60 + at.getMinutes()
}
