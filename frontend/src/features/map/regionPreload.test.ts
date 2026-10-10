import { describe, expect, it } from 'vitest'
import { countPreloadViewpoints, PRELOAD_BUDGET_MS, PRELOAD_VIEWPOINTS } from './regionPreload'

describe('regionPreload', () => {
  it('uses a small viewpoint set within a short budget', () => {
    expect(PRELOAD_VIEWPOINTS.length).toBeLessThanOrEqual(8)
    expect(countPreloadViewpoints()).toBe(PRELOAD_VIEWPOINTS.length)
    expect(PRELOAD_BUDGET_MS).toBe(10_000)
  })
})
