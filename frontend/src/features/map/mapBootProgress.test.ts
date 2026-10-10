import { describe, expect, it } from 'vitest'
import { mapBootLoadFraction } from './mapBootProgress'

describe('mapBootLoadFraction', () => {
  it('starts after setup and before the first viewpoint', () => {
    expect(mapBootLoadFraction(0, 6)).toBeCloseTo(0.15)
  })

  it('reaches the end when every viewpoint is done', () => {
    expect(mapBootLoadFraction(6, 6)).toBe(1)
  })

  it('does not exceed one', () => {
    expect(mapBootLoadFraction(8, 6)).toBe(1)
  })
})
