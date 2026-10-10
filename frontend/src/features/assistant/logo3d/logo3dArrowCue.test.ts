import { describe, expect, it } from 'vitest'
import { arrowCueOffsetY } from './logo3dArrowCue'
import { LOGO_ARROW_CUE_MS } from './logo3dRuntime'

describe('arrowCueOffsetY', () => {
  it('returns null outside the cue window', () => {
    expect(arrowCueOffsetY(-1)).toBeNull()
    expect(arrowCueOffsetY(LOGO_ARROW_CUE_MS + 1)).toBeNull()
  })

  it('spins through a full turn mid-cue', () => {
    const mid = arrowCueOffsetY(LOGO_ARROW_CUE_MS / 2)
    expect(mid).not.toBeNull()
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(Math.PI * 2)
  })
})
