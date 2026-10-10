import { describe, expect, it } from 'vitest'
import { zoomBumpForPlaceSpan } from './mapAgentFitPlaces'

describe('zoomBumpForPlaceSpan', () => {
  it('suggests zoom in when markers use little of the viewport', () => {
    const bump = zoomBumpForPlaceSpan(200, 120, 900, 700)
    expect(bump).toBeGreaterThan(0.2)
  })

  it('returns zero when markers already fill the viewport', () => {
    expect(zoomBumpForPlaceSpan(850, 650, 900, 700)).toBe(0)
  })
})
