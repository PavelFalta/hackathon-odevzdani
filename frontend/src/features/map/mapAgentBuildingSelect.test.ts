import { describe, expect, it, vi } from 'vitest'
import { selectAgentBuildingAtPlace } from './mapAgentBuildingSelect'

describe('selectAgentBuildingAtPlace', () => {
  it('selects the two nearest 3D footprints when several match', () => {
    const near = {
      id: 'b1',
      properties: { group: 'building-3d' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [12.37, 50.07],
            [12.3701, 50.07],
            [12.3701, 50.0701],
            [12.37, 50.0701],
            [12.37, 50.07],
          ],
        ],
      },
    }
    const next = {
      id: 'b2',
      properties: { group: 'building-3d' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [12.371, 50.071],
            [12.3711, 50.071],
            [12.3711, 50.0711],
            [12.371, 50.0711],
            [12.371, 50.071],
          ],
        ],
      },
    }
    const far = {
      id: 'b3',
      properties: { group: 'building-3d' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [12.38, 50.08],
            [12.3801, 50.08],
            [12.3801, 50.0801],
            [12.38, 50.0801],
            [12.38, 50.08],
          ],
        ],
      },
    }
    const map = {
      queryRenderedFeatures: vi.fn(() => [far, next, near]),
      setFeatureState: vi.fn(),
    }

    expect(selectAgentBuildingAtPlace(map as never, 12.37, 50.07)).toBe(true)
    expect(map.setFeatureState).toHaveBeenCalledTimes(2)
    expect(map.setFeatureState).toHaveBeenCalledWith(near, { select: true })
    expect(map.setFeatureState).toHaveBeenCalledWith(next, { select: true })
  })

  it('returns false when no building is found', () => {
    const map = {
      queryRenderedFeatures: vi.fn(() => []),
      setFeatureState: vi.fn(),
    }
    expect(selectAgentBuildingAtPlace(map as never, 12.37, 50.07)).toBe(false)
  })
})
