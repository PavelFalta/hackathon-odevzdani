import { describe, expect, it } from 'vitest'
import { buildGoogleMapsRouteUrl } from './googleMapsRouteUrl'

describe('buildGoogleMapsRouteUrl', () => {
  it('builds a Google Maps directions URL', () => {
    const url = buildGoogleMapsRouteUrl({
      fromLat: 50.23,
      fromLon: 12.87,
      toLat: 50.31,
      toLon: 12.95,
      profile: 'walking',
    })
    expect(url).toContain('google.com/maps/dir/')
    expect(url).toContain('origin=50.23%2C12.87')
    expect(url).toContain('travelmode=walking')
  })
})
