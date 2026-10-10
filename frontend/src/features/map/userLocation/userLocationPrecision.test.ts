import { describe, expect, it } from 'vitest'
import { CHEB_CENTER } from '../region'
import {
  isGeolocationPreciseEnough,
  isInKvkBounds,
  USER_LOCATION_MAX_ACCURACY_M,
} from './userLocationPrecision'

describe('userLocationPrecision', () => {
  it('accepts accuracy at the configured ceiling', () => {
    expect(isGeolocationPreciseEnough(USER_LOCATION_MAX_ACCURACY_M)).toBe(true)
    expect(isGeolocationPreciseEnough(USER_LOCATION_MAX_ACCURACY_M + 1)).toBe(false)
  })

  it('treats Cheb as inside the kraj bounds', () => {
    const [lon, lat] = CHEB_CENTER
    expect(isInKvkBounds(lon, lat)).toBe(true)
  })

  it('rejects coordinates far outside the kraj', () => {
    expect(isInKvkBounds(14.4, 50.1)).toBe(false)
  })
})
