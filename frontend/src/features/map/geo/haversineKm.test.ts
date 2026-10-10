import { describe, expect, it } from 'vitest'
import { haversineKm } from './haversineKm'

describe('haversineKm', () => {
  it('is near zero for identical points', () => {
    expect(haversineKm(12.87, 50.23, 12.87, 50.23)).toBeLessThan(0.01)
  })
})
