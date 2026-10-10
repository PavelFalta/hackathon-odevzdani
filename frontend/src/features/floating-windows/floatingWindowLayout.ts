import {
  assignCorner,
  clampSizeToCornerSlot,
  layoutWindowAtCorner,
  rectAtCorner,
} from './floatingWindowCorners'
import type { FloatingCorner, FloatingRect, FloatingWindowRecord } from './floatingWindowTypes'
import { clampRectToViewport, getFloatingViewport } from './floatingWindowViewport'

const GAP = 10

export function rectsOverlap(a: FloatingRect, b: FloatingRect, gap = GAP): boolean {
  return (
    a.x < b.x + b.w + gap && a.x + a.w + gap > b.x && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y
  )
}

export { clampRectToViewport } from './floatingWindowViewport'

export function clampWindowsToViewport(list: FloatingWindowRecord[]): FloatingWindowRecord[] {
  return list.map((win) => layoutWindowAtCorner(win))
}

export function placeNewWindow(
  existing: FloatingWindowRecord[],
  input: {
    id: string
    kind: FloatingWindowRecord['kind']
    label: string
    anchor: FloatingCorner
    defaultSize: Pick<FloatingRect, 'w' | 'h'>
  },
  zIndex: number,
): FloatingWindowRecord {
  const viewport = getFloatingViewport()
  const anchor = assignCorner(input.anchor, existing)
  const size = clampSizeToCornerSlot(input.defaultSize, viewport, input.kind)
  const rect = rectAtCorner(anchor, size, viewport, input.kind)
  return {
    id: input.id,
    kind: input.kind,
    label: input.label,
    anchor,
    rect,
    zIndex,
    userStacked: false,
  }
}

export function resizeWindowRect(
  win: FloatingWindowRecord,
  _others: FloatingWindowRecord[],
  size: Pick<FloatingRect, 'w' | 'h'>,
): FloatingRect {
  const viewport = getFloatingViewport()
  return clampRectToViewport(rectAtCorner(win.anchor, size, viewport, win.kind), viewport)
}
