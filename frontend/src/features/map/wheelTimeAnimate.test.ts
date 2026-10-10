import { describe, expect, it } from 'vitest'
import { easeOutCubic, interpolateDayMinutes } from './wheelTimeAnimate'

describe('wheelTimeAnimate', () => {
  it('eases toward 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })

  it('interpolates across midnight on the short arc', () => {
    expect(interpolateDayMinutes(23 * 60, 1 * 60, 0.5)).toBe(0)
    expect(interpolateDayMinutes(6 * 60, 12 * 60, 0.5)).toBe(9 * 60)
  })
})
