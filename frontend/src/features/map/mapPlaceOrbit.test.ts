import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  bindAgentPlaceOrbitMap,
  ORBIT_BEARING_STEP_DEG,
  releaseAgentPlaceOrbit,
  resetAgentPlaceOrbitDirectionForTests,
  startAgentPlaceOrbit,
  stopAgentPlaceOrbit,
} from './mapPlaceOrbit'

function mockMap(bearing = 10) {
  return {
    stop: vi.fn(),
    getZoom: () => 17,
    getPitch: () => 58,
    getBearing: () => bearing,
    easeTo: vi.fn(),
    once: vi.fn(),
  }
}

describe('mapPlaceOrbit', () => {
  beforeEach(() => {
    resetAgentPlaceOrbitDirectionForTests()
  })

  it('does not map.stop when orbit was already idle', () => {
    const map = mockMap()
    stopAgentPlaceOrbit(map as never)
    expect(map.stop).not.toHaveBeenCalled()
  })

  it('stops the map before starting a new orbit', () => {
    const map = mockMap()
    startAgentPlaceOrbit(map as never, 12.37, 50.07)
    startAgentPlaceOrbit(map as never, 12.37, 50.07)
    expect(map.stop).toHaveBeenCalledTimes(1)
    expect(map.easeTo).toHaveBeenCalledWith(
      expect.objectContaining({ bearing: 10 + ORBIT_BEARING_STEP_DEG }),
    )
  })

  it('release stops the bound map orbit', () => {
    const map = mockMap()
    bindAgentPlaceOrbitMap(map as never)
    startAgentPlaceOrbit(map as never, 12.37, 50.07)
    releaseAgentPlaceOrbit()
    expect(map.stop).toHaveBeenCalled()
    bindAgentPlaceOrbitMap(null)
  })

  it('alternates rotation direction on each new focus', () => {
    const map = mockMap()
    startAgentPlaceOrbit(map as never, 12.37, 50.07)
    startAgentPlaceOrbit(map as never, 12.37, 50.07)
    const bearings = map.easeTo.mock.calls.map((call) => (call[0] as { bearing: number }).bearing)
    expect(bearings[0]).toBe(10 + ORBIT_BEARING_STEP_DEG)
    expect(bearings[1]).toBe(10 - ORBIT_BEARING_STEP_DEG)
  })
})
