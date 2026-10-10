import { describe, expect, it } from 'vitest'
import {
  lightPresetFromLocalHour,
  snapWheelIndexFromAngle,
  wheelAngleForIndex,
  presetAtWheelIndex,
} from './lightPresetWheel'

describe('lightPresetWheel', () => {
  it('maps local hours to lighting presets', () => {
    expect(lightPresetFromLocalHour(6)).toBe('dawn')
    expect(lightPresetFromLocalHour(12)).toBe('day')
    expect(lightPresetFromLocalHour(18)).toBe('dusk')
    expect(lightPresetFromLocalHour(23)).toBe('night')
  })

  it('snaps pointer angles to four stages along the semicircle', () => {
    expect(snapWheelIndexFromAngle(-Math.PI)).toBe(0)
    expect(snapWheelIndexFromAngle(-0.05)).toBe(3)
    expect(presetAtWheelIndex(snapWheelIndexFromAngle(wheelAngleForIndex(2)))).toBe('dusk')
  })
})
