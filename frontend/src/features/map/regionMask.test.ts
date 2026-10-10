import { describe, expect, it } from 'vitest'
import { buildOutsideMaskFeature, reverseRing, type KvkPolygonFeature } from './regionMask'

const square: KvkPolygonFeature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [12.5, 50.0],
        [12.6, 50.0],
        [12.6, 50.1],
        [12.5, 50.1],
        [12.5, 50.0],
      ],
    ],
  },
}

describe('regionMask', () => {
  it('reverses a ring', () => {
    const ring: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ]
    expect(reverseRing(ring)).toEqual([
      [1, 1],
      [1, 0],
      [0, 0],
    ])
  })

  it('builds a world outer ring with the boundary as a hole', () => {
    const mask = buildOutsideMaskFeature(square)
    expect(mask.geometry.type).toBe('Polygon')
    expect(mask.geometry.coordinates).toHaveLength(2)
    expect(mask.geometry.coordinates[0][0]).toEqual([-180, -85])
    expect(mask.geometry.coordinates[1]).toEqual(reverseRing(square.geometry.coordinates[0]))
  })
})
