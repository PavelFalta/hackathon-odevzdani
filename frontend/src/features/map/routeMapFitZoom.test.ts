import { describe, expect, it } from 'vitest'
import { minZoomForShortRoute } from './routeMapFitZoom'

describe('minZoomForShortRoute', () => {
  it('raises zoom floor for nearby destinations', () => {
    expect(minZoomForShortRoute(80)).toBe(17.4)
    expect(minZoomForShortRoute(200)).toBe(16.8)
    expect(minZoomForShortRoute(400)).toBe(16.2)
    expect(minZoomForShortRoute(800)).toBeNull()
  })
})
