import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_BASEMAP_STYLE } from './basemapStyle'
import {
  basemapStyleForPerformanceMode,
  patchBasemapForPerformanceToggle,
  resetMapPerformanceModeViewForTests,
  syncMapPerformanceModeView,
} from './mapPerformanceMode'
import { CHEB_VIEW } from './region'

describe('mapPerformanceMode', () => {
  it('strips terrain and 3D layers for 2D mode', () => {
    const base = { ...DEFAULT_BASEMAP_STYLE, show3dObjects: true, terrainExaggeration: 1.45 }
    const flat = basemapStyleForPerformanceMode(base, '2d')
    expect(flat.show3dObjects).toBe(false)
    expect(flat.terrainExaggeration).toBe(0)
  })

  it('restores saved 3D basemap flags when leaving 2D', () => {
    const base = { ...DEFAULT_BASEMAP_STYLE, show3dObjects: false, terrainExaggeration: 0.8 }
    const into2d = patchBasemapForPerformanceToggle(base, '2d', null)
    expect(into2d.next.terrainExaggeration).toBe(0)
    expect(into2d.saved3d?.terrainExaggeration).toBe(0.8)

    const back3d = patchBasemapForPerformanceToggle(into2d.next, '3d', into2d.saved3d)
    expect(back3d.next.terrainExaggeration).toBe(0.8)
    expect(back3d.next.show3dObjects).toBe(false)
    expect(back3d.saved3d).toBeNull()
  })

  it('restores oblique pitch when leaving 2D performance mode', () => {
    resetMapPerformanceModeViewForTests()
    const easeTo = vi.fn()
    const map = {
      getPitch: () => 58,
      getSource: () => ({}),
      easeTo,
      setTerrain: vi.fn(),
      touchPitch: { disable: vi.fn(), enable: vi.fn() },
      dragRotate: { disablePitch: vi.fn(), enablePitch: vi.fn() },
    } as never

    syncMapPerformanceModeView(map, '2d')
    syncMapPerformanceModeView(map, '3d')

    expect(easeTo).toHaveBeenLastCalledWith(expect.objectContaining({ pitch: 58, essential: true }))
  })

  it('uses default Cheb pitch when returning to 3D from a flat camera', () => {
    resetMapPerformanceModeViewForTests()
    const easeTo = vi.fn()
    const map = {
      getPitch: () => 0,
      getSource: () => ({}),
      easeTo,
      setTerrain: vi.fn(),
      touchPitch: { disable: vi.fn(), enable: vi.fn() },
      dragRotate: { disablePitch: vi.fn(), enablePitch: vi.fn() },
    } as never

    syncMapPerformanceModeView(map, '2d')
    syncMapPerformanceModeView(map, '3d')

    expect(easeTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ pitch: CHEB_VIEW.pitch, essential: true }),
    )
  })
})
