import { afterEach, describe, expect, it, vi } from 'vitest'
import * as floatingWindowViewport from './floatingWindowViewport'
import {
  assignCorner,
  cornerSlotMaxSize,
  MAX_FLOATING_WINDOWS,
  pickEvictionId,
  rectAtCorner,
} from './floatingWindowCorners'
import { clampRectToViewport, placeNewWindow, rectsOverlap } from './floatingWindowLayout'
import type { FloatingWindowRecord } from './floatingWindowTypes'

const viewport = { x: 12, y: 60, w: 400, h: 500 }

describe('floatingWindowLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('detects overlap with gap', () => {
    const a = { x: 10, y: 10, w: 100, h: 100 }
    const b = { x: 105, y: 10, w: 100, h: 100 }
    expect(rectsOverlap(a, b)).toBe(true)
    expect(rectsOverlap(a, { ...b, x: 130 })).toBe(false)
  })

  it('clamps rect fully inside viewport', () => {
    const bleed = floatingWindowViewport.FLOATING_PANEL_BLEED
    const clamped = clampRectToViewport({ x: -50, y: 20, w: 500, h: 600 }, viewport)
    expect(clamped.x).toBe(viewport.x + bleed)
    expect(clamped.y).toBe(viewport.y + bleed)
    expect(clamped.x + clamped.w).toBeLessThanOrEqual(viewport.x + viewport.w - bleed)
    expect(clamped.y + clamped.h).toBeLessThanOrEqual(viewport.y + viewport.h - bleed)
  })

  it('places four windows on distinct corners without overlap', () => {
    vi.spyOn(floatingWindowViewport, 'getFloatingViewport').mockReturnValue(viewport)
    let list: FloatingWindowRecord[] = []
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const
    for (const corner of corners) {
      const placed = placeNewWindow(
        list,
        {
          id: corner,
          kind: 'reviews',
          label: corner,
          anchor: corner,
          defaultSize: { w: 200, h: 180 },
        },
        list.length + 1,
      )
      list = [...list, placed]
    }
    expect(list).toHaveLength(MAX_FLOATING_WINDOWS)
    const rects = list.map((w) => w.rect)
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        expect(rectsOverlap(rects[i], rects[j])).toBe(false)
      }
    }
  })

  it('assigns next free corner when preferred is taken', () => {
    vi.spyOn(floatingWindowViewport, 'getFloatingViewport').mockReturnValue(viewport)
    const existing: FloatingWindowRecord[] = [
      {
        id: 'a',
        kind: 'reviews',
        label: 'A',
        anchor: 'bottom-left',
        rect: rectAtCorner('bottom-left', { w: 120, h: 120 }, viewport),
        zIndex: 1,
        userStacked: false,
      },
    ]
    expect(assignCorner('bottom-left', existing)).toBe('top-left')
  })

  it('evicts reviews before assistant when at capacity', () => {
    vi.spyOn(floatingWindowViewport, 'getFloatingViewport').mockReturnValue(viewport)
    const windows: FloatingWindowRecord[] = [
      {
        id: 'chat',
        kind: 'assistant',
        label: 'Chat',
        anchor: 'bottom-left',
        rect: rectAtCorner('bottom-left', { w: 120, h: 120 }, viewport),
        zIndex: 10,
        userStacked: false,
      },
      {
        id: 'rev',
        kind: 'reviews',
        label: 'Rev',
        anchor: 'top-left',
        rect: rectAtCorner('top-left', { w: 120, h: 120 }, viewport),
        zIndex: 2,
        userStacked: false,
      },
    ]
    expect(pickEvictionId(windows, { id: 'new', kind: 'browser' })).toBe('rev')
  })

  it('caps corner slot size to keep map center clear', () => {
    const wide = cornerSlotMaxSize({ x: 0, y: 0, w: 1200, h: 900 })
    expect(wide.w).toBeLessThan(1200 * 0.5)
    expect(wide.h).toBeLessThan(900 * 0.5)
  })

  it('allows a larger corner slot for assistant than reviews', () => {
    const viewport = { x: 0, y: 0, w: 1200, h: 900 }
    const reviews = cornerSlotMaxSize(viewport, 'reviews')
    const assistant = cornerSlotMaxSize(viewport, 'assistant')
    expect(assistant.w).toBeGreaterThan(reviews.w)
    expect(assistant.h).toBeGreaterThan(reviews.h)
  })
})
