import { describe, expect, it } from 'vitest'
import { shortestDayMinuteDelta, wheelAnimationDurationMs } from './mapTimeWheelTiming'

describe('mapTimeWheelTiming', () => {
  it('uses the short arc around midnight', () => {
    expect(shortestDayMinuteDelta(23 * 60, 1 * 60)).toBe(120)
  })

  it('scales duration with travel distance', () => {
    const short = wheelAnimationDurationMs(12 * 60, 12 * 60 + 20)
    const long = wheelAnimationDurationMs(12 * 60, 14 * 60)
    expect(long).toBeGreaterThan(short)
  })
})
