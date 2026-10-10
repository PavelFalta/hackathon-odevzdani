import { describe, expect, it } from 'vitest'
import { formatWheelClock, minutesFromWheelAngle, wheelAngleFromMinutes } from './wheelTimeCycle'
import { WHEEL_PRESET_ANGLE } from './lightPresetWheel'

describe('wheelTimeCycle', () => {
  it('formats a 24h clock readout', () => {
    expect(formatWheelClock(18 * 60 + 45)).toBe('18:45')
    expect(formatWheelClock(24 * 60)).toBe('00:00')
  })

  it('maps arc angles to minutes along the day cycle', () => {
    expect(minutesFromWheelAngle(WHEEL_PRESET_ANGLE.day)).toBe(12 * 60)
    expect(minutesFromWheelAngle(WHEEL_PRESET_ANGLE.dusk)).toBeCloseTo(18 * 60, 0)
  })

  it('round-trips minutes through angle', () => {
    const angle = wheelAngleFromMinutes(18 * 60 + 45)
    expect(formatWheelClock(minutesFromWheelAngle(angle))).toBe('18:45')
  })

  it('maps post-midnight hours on the right arc instead of clamping to dawn', () => {
    const angle = wheelAngleFromMinutes(70)
    expect(angle).toBeGreaterThan(WHEEL_PRESET_ANGLE.night)
    expect(angle).toBeLessThanOrEqual(0)
    expect(formatWheelClock(minutesFromWheelAngle(angle))).toBe('01:10')
  })
})
