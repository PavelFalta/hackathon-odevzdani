const DAY_MINUTES = 24 * 60

export function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  return 1 - (1 - x) ** 3
}

/** Shortest path around the 24h clock. */
export function interpolateDayMinutes(from: number, to: number, t: number): number {
  let delta = (to - from) % DAY_MINUTES
  if (delta > DAY_MINUTES / 2) delta -= DAY_MINUTES
  if (delta < -DAY_MINUTES / 2) delta += DAY_MINUTES
  const next = from + delta * t
  return ((next % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
}

export type WheelMinutesAnimation = {
  cancel: () => void
}

export function animateWheelMinutes(
  fromMinutes: number,
  toMinutes: number,
  durationMs: number,
  onFrame: (minutes: number, progress: number) => void,
  onDone?: () => void,
): WheelMinutesAnimation {
  const start = performance.now()
  let frame = 0

  const tick = (now: number) => {
    const elapsed = now - start
    const t = easeOutCubic(durationMs <= 0 ? 1 : Math.min(1, elapsed / durationMs))
    onFrame(interpolateDayMinutes(fromMinutes, toMinutes, t), t)
    if (t < 1) {
      frame = requestAnimationFrame(tick)
      return
    }
    onDone?.()
  }

  frame = requestAnimationFrame(tick)

  return {
    cancel: () => {
      cancelAnimationFrame(frame)
    },
  }
}
