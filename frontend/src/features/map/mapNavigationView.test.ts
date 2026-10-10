import { describe, expect, it, vi } from 'vitest'
import {
  resetMapNavigationViewForTests,
  setMapNavigationFlatView,
  setMapPerformance2dLock,
  syncMapPerformance2dPitchControls,
} from './mapNavigationView'

function mockMap(pitch = 42) {
  return {
    getPitch: () => pitch,
    jumpTo: vi.fn(),
    easeTo: vi.fn(),
    touchPitch: { disable: vi.fn(), enable: vi.fn() },
    dragRotate: { disablePitch: vi.fn(), enablePitch: vi.fn() },
  }
}

describe('mapNavigationView', () => {
  it('flattens pitch while active and restores after release', () => {
    resetMapNavigationViewForTests()
    const map = mockMap(42)
    setMapNavigationFlatView(map as never, true)
    expect(map.touchPitch.disable).toHaveBeenCalled()
    expect(map.jumpTo).toHaveBeenCalledWith(expect.objectContaining({ pitch: 0 }))
    setMapNavigationFlatView(map as never, false)
    expect(map.easeTo).toHaveBeenLastCalledWith(expect.objectContaining({ pitch: 42 }))
  })

  it('keeps pitch flat after navigation when 2D performance lock is on', () => {
    resetMapNavigationViewForTests()
    const map = mockMap(42)
    syncMapPerformance2dPitchControls(map as never, true)
    setMapNavigationFlatView(map as never, true)
    setMapNavigationFlatView(map as never, false)
    expect(map.easeTo).not.toHaveBeenCalled()
    expect(map.touchPitch.enable).not.toHaveBeenCalled()
    setMapPerformance2dLock(false)
  })
})
