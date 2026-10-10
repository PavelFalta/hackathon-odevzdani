import { describe, expect, it, vi } from 'vitest'
import { KVK_BOUNDS } from './region'
import { applyKrajViewportLimits, kvkLngLatBounds } from './mapViewportLimits'

describe('mapViewportLimits', () => {
  it('skips setMinZoom when the fit zoom is unchanged', () => {
    const setMinZoom = vi.fn()
    const setZoom = vi.fn()
    const map = {
      setMaxBounds: vi.fn(),
      cameraForBounds: () => ({ zoom: 8.5 }),
      getBearing: () => 0,
      getPitch: () => 45,
      getMinZoom: () => 8.5,
      getZoom: () => 12,
      setMinZoom,
      setZoom,
    }
    applyKrajViewportLimits(map as never)
    expect(setMinZoom).not.toHaveBeenCalled()
    expect(setZoom).not.toHaveBeenCalled()
  })

  it('builds lng-lat bounds from the official kraj bbox', () => {
    const bounds = kvkLngLatBounds()
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    expect(sw.lng).toBe(KVK_BOUNDS[0][0])
    expect(sw.lat).toBe(KVK_BOUNDS[0][1])
    expect(ne.lng).toBe(KVK_BOUNDS[1][0])
    expect(ne.lat).toBe(KVK_BOUNDS[1][1])
  })
})
