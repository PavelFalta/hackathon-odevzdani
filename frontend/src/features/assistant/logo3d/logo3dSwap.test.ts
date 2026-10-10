import { describe, expect, it } from 'vitest'
import { LOGO_SWAP_DURATION_MS, LOGO_SWAP_HOLD_MS, logoSwapBlend } from './logo3dSwap'

describe('logoSwapBlend', () => {
  it('holds circle then cube across a full cycle', () => {
    expect(logoSwapBlend(0)).toBe(0)
    expect(logoSwapBlend(LOGO_SWAP_HOLD_MS - 1)).toBe(0)
    expect(logoSwapBlend(LOGO_SWAP_HOLD_MS + LOGO_SWAP_DURATION_MS)).toBe(1)
    const segment = LOGO_SWAP_HOLD_MS + LOGO_SWAP_DURATION_MS
    expect(logoSwapBlend(segment + LOGO_SWAP_HOLD_MS)).toBe(1)
    expect(logoSwapBlend(segment * 2)).toBe(0)
  })
})
