import { describe, expect, it } from 'vitest'
import { CHEB_CENTER, KVK_BOUNDS } from './region'

describe('region', () => {
  it('keeps Cheb inside Karlovarský kraj bounds', () => {
    const [sw, ne] = KVK_BOUNDS
    const [lng, lat] = CHEB_CENTER
    expect(lng).toBeGreaterThan(sw[0])
    expect(lng).toBeLessThan(ne[0])
    expect(lat).toBeGreaterThan(sw[1])
    expect(lat).toBeLessThan(ne[1])
  })
})
