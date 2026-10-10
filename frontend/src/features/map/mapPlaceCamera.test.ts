import { describe, expect, it } from 'vitest'
import { defaultPlaceFocusZoom, PLACE_FOCUS_PITCH, resolvePlaceFocusZoom } from './mapPlaceCamera'

describe('mapPlaceCamera', () => {
  it('uses a close street-level default zoom at cinematic pitch', () => {
    expect(defaultPlaceFocusZoom(PLACE_FOCUS_PITCH)).toBeGreaterThan(17)
  })

  it('honours an explicit zoom override', () => {
    expect(resolvePlaceFocusZoom(14)).toBe(14)
  })
})
