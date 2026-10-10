import { afterEach, describe, expect, it, vi } from 'vitest'
import { layoutWindowAtCorner, rectAtCorner } from './floatingWindowCorners'
import { clampWindowsToViewport } from './floatingWindowLayout'
import type { FloatingWindowRecord } from './floatingWindowTypes'
import * as floatingWindowViewport from './floatingWindowViewport'

const viewport = { x: 12, y: 60, w: 400, h: 500 }

describe('clampWindowsToViewport', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('re-anchors user-stacked windows to their corner on viewport resize', () => {
    vi.spyOn(floatingWindowViewport, 'getFloatingViewport').mockReturnValue(viewport)
    const dragged: FloatingWindowRecord = {
      id: 'browser',
      kind: 'browser',
      label: 'Web',
      anchor: 'top-right',
      rect: { x: 80, y: 120, w: 180, h: 200 },
      zIndex: 5,
      userStacked: true,
    }
    const [next] = clampWindowsToViewport([dragged])
    const expected = layoutWindowAtCorner(dragged)
    expect(next.rect).toEqual(expected.rect)
    expect(next.userStacked).toBe(false)
  })

  it('keeps bottom-left anchor when height shrinks', () => {
    const small = { x: 12, y: 60, w: 400, h: 300 }
    vi.spyOn(floatingWindowViewport, 'getFloatingViewport').mockReturnValue(small)
    const win: FloatingWindowRecord = {
      id: 'rev',
      kind: 'reviews',
      label: 'Recenze',
      anchor: 'bottom-left',
      rect: rectAtCorner('bottom-left', { w: 160, h: 220 }, viewport),
      zIndex: 2,
      userStacked: false,
    }
    const [next] = clampWindowsToViewport([win])
    const expected = layoutWindowAtCorner({ ...win, rect: { ...win.rect, h: 220, w: 160 } })
    expect(next.rect).toEqual(expected.rect)
  })
})
