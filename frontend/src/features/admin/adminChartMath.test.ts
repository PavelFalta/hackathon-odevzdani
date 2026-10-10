import { describe, expect, it } from 'vitest'
import { chartMax, linePath } from './adminChartMath'

describe('adminChartMath', () => {
  it('chartMax respects floor', () => {
    expect(chartMax([0, 0], 5)).toBe(5)
    expect(chartMax([2, 8], 1)).toBe(8)
  })

  it('linePath returns points for values', () => {
    const path = linePath([1, 2, 1], 100, 50, 10, 2)
    expect(path.startsWith('M ')).toBe(true)
    expect(path.includes('L')).toBe(true)
  })
})
