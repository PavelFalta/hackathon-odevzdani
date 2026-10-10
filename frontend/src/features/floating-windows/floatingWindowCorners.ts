import type {
  FloatingCorner,
  FloatingRect,
  FloatingWindowKind,
  FloatingWindowRecord,
} from './floatingWindowTypes'
import { clampRectToViewport, getFloatingViewport } from './floatingWindowViewport'

export const MAX_FLOATING_WINDOWS = 4

export const FLOATING_CORNERS: FloatingCorner[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

const KIND_EVICTION_RANK: Record<FloatingWindowKind, number> = {
  reviews: 0,
  photos: 0,
  navigation: 0,
  browser: 1,
  timetable: 1,
  assistant: 3,
}

const CORNER_SLOT_FACTORS: Record<FloatingWindowKind, { w: number; h: number }> = {
  reviews: { w: 0.36, h: 0.4 },
  photos: { w: 0.38, h: 0.44 },
  navigation: { w: 0.38, h: 0.46 },
  browser: { w: 0.48, h: 0.4 },
  timetable: { w: 0.38, h: 0.46 },
  assistant: { w: 0.44, h: 0.52 },
}

export function cornerSlotMaxSize(
  viewport: FloatingRect,
  kind?: FloatingWindowKind,
): Pick<FloatingRect, 'w' | 'h'> {
  const factors = kind ? CORNER_SLOT_FACTORS[kind] : CORNER_SLOT_FACTORS.reviews
  return {
    w: Math.max(120, Math.floor(viewport.w * factors.w)),
    h: Math.max(100, Math.floor(viewport.h * factors.h)),
  }
}

export function clampSizeToCornerSlot(
  size: Pick<FloatingRect, 'w' | 'h'>,
  viewport: FloatingRect,
  kind?: FloatingWindowKind,
): Pick<FloatingRect, 'w' | 'h'> {
  const max = cornerSlotMaxSize(viewport, kind)
  return {
    w: Math.min(Math.max(120, size.w), max.w),
    h: Math.min(Math.max(100, size.h), max.h),
  }
}

export function rectAtCorner(
  corner: FloatingCorner,
  size: Pick<FloatingRect, 'w' | 'h'>,
  viewport: FloatingRect,
  kind?: FloatingWindowKind,
): FloatingRect {
  const { w, h } = clampSizeToCornerSlot(size, viewport, kind)
  let rect: FloatingRect
  switch (corner) {
    case 'top-left':
      rect = { x: viewport.x, y: viewport.y, w, h }
      break
    case 'top-right':
      rect = { x: viewport.x + viewport.w - w, y: viewport.y, w, h }
      break
    case 'bottom-left':
      rect = { x: viewport.x, y: viewport.y + viewport.h - h, w, h }
      break
    case 'bottom-right':
      rect = { x: viewport.x + viewport.w - w, y: viewport.y + viewport.h - h, w, h }
      break
  }
  return clampRectToViewport(rect, viewport)
}

export function assignCorner(
  preferred: FloatingCorner,
  existing: FloatingWindowRecord[],
): FloatingCorner {
  const used = new Set(existing.map((w) => w.anchor))
  if (!used.has(preferred)) return preferred
  for (const corner of FLOATING_CORNERS) {
    if (!used.has(corner)) return corner
  }
  return preferred
}

export function pickEvictionId(
  windows: FloatingWindowRecord[],
  incoming: { id: string; kind: FloatingWindowKind },
): string | null {
  const candidates = windows.filter((w) => w.id !== incoming.id)
  if (!candidates.length) return null
  const sorted = [...candidates].sort(
    (a, b) => KIND_EVICTION_RANK[a.kind] - KIND_EVICTION_RANK[b.kind] || a.zIndex - b.zIndex,
  )
  return sorted[0].id
}

export function layoutWindowAtCorner(win: FloatingWindowRecord): FloatingWindowRecord {
  const viewport = getFloatingViewport()
  const rect = rectAtCorner(win.anchor, win.rect, viewport, win.kind)
  return { ...win, rect, userStacked: false }
}
