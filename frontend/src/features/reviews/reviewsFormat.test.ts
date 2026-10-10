import { describe, expect, it } from 'vitest'
import { formatReviewCount } from './reviewsFormat'

describe('reviewsFormat', () => {
  it('formats Czech review count', () => {
    expect(formatReviewCount(84)).toMatch(/84.*hodnocení/)
  })
})
