import { describe, expect, it, vi } from 'vitest'
import { applyBasemapStyle, basemapImportConfig, DEFAULT_BASEMAP_STYLE } from './basemapStyle'

describe('basemapStyle', () => {
  it('enables Standard 3D trees with the 3D objects toggle', () => {
    const props: Record<string, unknown> = {}
    const map = {
      setConfigProperty: (scope: string, key: string, value: unknown) => {
        if (scope === 'basemap') props[key] = value
      },
      getSource: () => null,
      setTerrain: vi.fn(),
    }

    applyBasemapStyle(map as never, DEFAULT_BASEMAP_STYLE)

    expect(props.show3dObjects).toBe(true)
    expect(props.show3dTrees).toBe(true)
    expect(props.show3dBuildings).toBe(true)
    expect(map.setTerrain).not.toHaveBeenCalled()
  })

  it('clears terrain when exaggeration is zero', () => {
    const map = {
      setConfigProperty: vi.fn(),
      getSource: () => ({}),
      setTerrain: vi.fn(),
    }
    applyBasemapStyle(map as never, { ...DEFAULT_BASEMAP_STYLE, terrainExaggeration: 0 })
    expect(map.setTerrain).toHaveBeenCalledWith(null)
  })

  it('uses satellite imagery config without 3D object flags', () => {
    const satellite = basemapImportConfig({
      ...DEFAULT_BASEMAP_STYLE,
      basemapAppearance: 'satellite',
    })
    expect(satellite.basemap.showRoadsAndTransit).toBe(true)
    expect('show3dTrees' in satellite.basemap).toBe(false)
  })
})
