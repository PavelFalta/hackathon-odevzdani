import { describe, expect, it } from 'vitest'
import { resolveKairosGlMode } from './kairosGlMode'

describe('resolveKairosGlMode', () => {
  it('keeps login-style motion and hover', () => {
    expect(resolveKairosGlMode({ buildingHover: true })).toEqual({
      ambient: false,
      buildingHover: true,
      scrollMul: 1,
      mature: 0,
    })
  })

  it('freezes a mature city for ambient boot', () => {
    expect(resolveKairosGlMode({ ambient: true })).toEqual({
      ambient: true,
      buildingHover: false,
      scrollMul: 0,
      mature: 1,
    })
  })
})
