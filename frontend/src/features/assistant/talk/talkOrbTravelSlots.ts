import { clampRectToViewport, rectsOverlap } from '../../floating-windows/floatingWindowLayout'
import type { FloatingRect } from '../../floating-windows/floatingWindowTypes'
import { getFloatingViewport } from '../../floating-windows/floatingWindowViewport'

const EDGE_MARGIN = 10
const OBSTACLE_GAP = 16
const MIN_TRAVEL_PX = 56

export function listTalkOrbEdgeSlots(
  viewport: FloatingRect,
  size: Pick<FloatingRect, 'w' | 'h'>,
): FloatingRect[] {
  const { w, h } = size
  const cx = viewport.x + (viewport.w - w) / 2
  const cy = viewport.y + (viewport.h - h) / 2
  const slots: FloatingRect[] = [
    { x: viewport.x + EDGE_MARGIN, y: viewport.y + EDGE_MARGIN, w, h },
    { x: viewport.x + viewport.w - w - EDGE_MARGIN, y: viewport.y + EDGE_MARGIN, w, h },
    { x: viewport.x + EDGE_MARGIN, y: viewport.y + viewport.h - h - EDGE_MARGIN, w, h },
    {
      x: viewport.x + viewport.w - w - EDGE_MARGIN,
      y: viewport.y + viewport.h - h - EDGE_MARGIN,
      w,
      h,
    },
    { x: cx, y: viewport.y + EDGE_MARGIN, w, h },
    { x: cx, y: viewport.y + viewport.h - h - EDGE_MARGIN, w, h },
    { x: viewport.x + EDGE_MARGIN, y: cy, w, h },
    { x: viewport.x + viewport.w - w - EDGE_MARGIN, y: cy, w, h },
  ]
  return slots.map((slot) => clampRectToViewport(slot, viewport))
}

function slotScore(slot: FloatingRect, current: FloatingRect, obstacles: FloatingRect[]): number {
  const sx = slot.x + slot.w / 2
  const sy = slot.y + slot.h / 2
  const ccx = current.x + current.w / 2
  const ccy = current.y + current.h / 2
  const distFromCurrent = Math.hypot(sx - ccx, sy - ccy)
  if (distFromCurrent < MIN_TRAVEL_PX) return -Infinity

  let minObsDist = Number.POSITIVE_INFINITY
  for (const obstacle of obstacles) {
    const ox = obstacle.x + obstacle.w / 2
    const oy = obstacle.y + obstacle.h / 2
    minObsDist = Math.min(minObsDist, Math.hypot(sx - ox, sy - oy))
  }
  return distFromCurrent * 0.35 + minObsDist * 0.65
}

export function pickTalkOrbTravelTarget(
  current: FloatingRect,
  obstacles: FloatingRect[],
  viewport = getFloatingViewport(),
): Pick<FloatingRect, 'x' | 'y'> | null {
  const free = listTalkOrbEdgeSlots(viewport, current).filter(
    (slot) => !obstacles.some((o) => rectsOverlap(slot, o, OBSTACLE_GAP)),
  )
  if (!free.length) return null

  let best = free[0]
  let bestScore = -Infinity
  for (const slot of free) {
    const score = slotScore(slot, current, obstacles)
    if (score > bestScore) {
      bestScore = score
      best = slot
    }
  }
  if (bestScore === -Infinity) {
    const fallback = free[Math.floor(Math.random() * free.length)]
    return { x: fallback.x, y: fallback.y }
  }
  return { x: best.x, y: best.y }
}
