const DAY_MINUTES = 24 * 60

export const WHEEL_FADE_IN_MS = 440
export const WHEEL_FADE_OUT_MS = 520
export const WHEEL_HOLD_MS = 750
export const WHEEL_MIN_ANIM_MS = 1_800
export const WHEEL_MAX_ANIM_MS = 4_400
export const WHEEL_MS_PER_MINUTE = 90

export type MapTimeWheelRevealPhase = 'idle' | 'enter' | 'run' | 'hold' | 'exit'

export function shortestDayMinuteDelta(from: number, to: number): number {
  let delta = (to - from) % DAY_MINUTES
  if (delta > DAY_MINUTES / 2) delta -= DAY_MINUTES
  if (delta < -DAY_MINUTES / 2) delta += DAY_MINUTES
  return Math.abs(delta)
}

export function wheelAnimationDurationMs(fromMinutes: number, toMinutes: number): number {
  const delta = shortestDayMinuteDelta(fromMinutes, toMinutes)
  const scaled = delta * WHEEL_MS_PER_MINUTE
  return Math.round(Math.min(WHEEL_MAX_ANIM_MS, Math.max(WHEEL_MIN_ANIM_MS, scaled)))
}
