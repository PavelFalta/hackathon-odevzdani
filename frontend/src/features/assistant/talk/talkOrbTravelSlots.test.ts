import { describe, expect, it } from 'vitest'
import { listTalkOrbEdgeSlots, pickTalkOrbTravelTarget } from './talkOrbTravelSlots'

const viewport = { x: 12, y: 60, w: 400, h: 500 }

describe('talkOrbTravelSlots', () => {
  it('offers edge slots inside the viewport', () => {
    const slots = listTalkOrbEdgeSlots(viewport, { w: 200, h: 224 })
    expect(slots.length).toBeGreaterThanOrEqual(8)
    for (const slot of slots) {
      expect(slot.x).toBeGreaterThanOrEqual(viewport.x)
      expect(slot.y).toBeGreaterThanOrEqual(viewport.y)
      expect(slot.x + slot.w).toBeLessThanOrEqual(viewport.x + viewport.w)
    }
  })

  it('returns a new edge slot when nothing blocks the viewport', () => {
    const current = { x: 12, y: 60, w: 200, h: 224 }
    const target = pickTalkOrbTravelTarget(current, [], viewport)
    expect(target).not.toBeNull()
    if (!target) return
    expect(Math.hypot(target.x - current.x, target.y - current.y)).toBeGreaterThan(40)
  })
})
