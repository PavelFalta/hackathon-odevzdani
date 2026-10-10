import { describe, expect, it, vi } from 'vitest'
import { mapResetNorthAndPitch, mapZoomIn, mapZoomOut } from './mapNavigationActions'

function mockMap() {
  return {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetNorthPitch: vi.fn(),
  }
}

describe('mapNavigationActions', () => {
  it('zooms with short animation', () => {
    const map = mockMap()
    mapZoomIn(map as never)
    mapZoomOut(map as never)
    expect(map.zoomIn).toHaveBeenCalledWith({ duration: 280 })
    expect(map.zoomOut).toHaveBeenCalledWith({ duration: 280 })
  })

  it('resets north and pitch like Mapbox navigation control', () => {
    const map = mockMap()
    mapResetNorthAndPitch(map as never)
    expect(map.resetNorthPitch).toHaveBeenCalledWith({ duration: 480 })
  })
})
