import { describe, expect, it } from 'vitest'
import { geographicBearingDeg, mapBearingForRouteLeftToRight } from './routeMapBearing'

describe('routeMapBearing', () => {
  it('uses eastward route bearing near 90°', () => {
    const b = geographicBearingDeg(12.8, 50.2, 12.95, 50.2)
    expect(b).toBeGreaterThan(80)
    expect(b).toBeLessThan(100)
  })

  it('offsets map bearing by 90° for left-to-right layout', () => {
    expect(mapBearingForRouteLeftToRight(12.8, 50.2, 12.95, 50.2)).toBeCloseTo(0, 0)
  })
})
