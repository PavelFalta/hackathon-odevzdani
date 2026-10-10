import { describe, expect, it } from 'vitest'
import { canGoNext, canGoPrevious, clampPhotoIndex } from './placePhotosCarousel'

describe('placePhotosCarousel', () => {
  it('disables previous on the first slide', () => {
    expect(canGoPrevious(0)).toBe(false)
    expect(canGoPrevious(2)).toBe(true)
  })

  it('disables next on the last slide', () => {
    expect(canGoNext(0, 3)).toBe(true)
    expect(canGoNext(2, 3)).toBe(false)
    expect(canGoNext(0, 0)).toBe(false)
  })

  it('clamps index into range', () => {
    expect(clampPhotoIndex(4, 2)).toBe(1)
    expect(clampPhotoIndex(-1, 2)).toBe(0)
    expect(clampPhotoIndex(0, 0)).toBe(0)
  })
})
