export const LOGO_SWAP_HOLD_MS = 550
export const LOGO_SWAP_DURATION_MS = 320

export function easeInOutCubic(t: number): number {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** 0 = circle prominent, 1 = cube prominent. */
export function logoSwapBlend(elapsedMs: number): number {
  const segment = LOGO_SWAP_HOLD_MS + LOGO_SWAP_DURATION_MS
  const cycle = segment * 2
  const t = elapsedMs % cycle
  if (t < LOGO_SWAP_HOLD_MS) return 0
  if (t < segment) {
    return easeInOutCubic((t - LOGO_SWAP_HOLD_MS) / LOGO_SWAP_DURATION_MS)
  }
  if (t < segment + LOGO_SWAP_HOLD_MS) return 1
  return 1 - easeInOutCubic((t - segment - LOGO_SWAP_HOLD_MS) / LOGO_SWAP_DURATION_MS)
}
