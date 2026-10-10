import type { FloatingRect } from './floatingWindowTypes'

export const FLOATING_EDGE_PAD = 12
/** Border + shadow bleed so panels never clip past the visual viewport. */
export const FLOATING_PANEL_BLEED = 2

export function getFloatingViewport(): FloatingRect {
  if (typeof document === 'undefined') {
    return { x: FLOATING_EDGE_PAD, y: FLOATING_EDGE_PAD, w: 800, h: 600 }
  }
  const header = document.querySelector('.shell-header')
  const top = header
    ? Math.ceil(header.getBoundingClientRect().bottom) + FLOATING_EDGE_PAD
    : FLOATING_EDGE_PAD
  const left = FLOATING_EDGE_PAD
  const right = document.documentElement.clientWidth - FLOATING_EDGE_PAD
  const bottom = window.innerHeight - FLOATING_EDGE_PAD
  const w = Math.max(120, right - left)
  const h = Math.max(120, bottom - top)
  return { x: left, y: top, w, h }
}

export function clampRectToViewport(rect: FloatingRect, viewport: FloatingRect): FloatingRect {
  const bleed = FLOATING_PANEL_BLEED
  const innerW = Math.max(80, viewport.w - bleed * 2)
  const innerH = Math.max(80, viewport.h - bleed * 2)
  const w = Math.min(Math.max(80, rect.w), innerW)
  const h = Math.min(Math.max(80, rect.h), innerH)
  const minX = viewport.x + bleed
  const minY = viewport.y + bleed
  const maxX = viewport.x + viewport.w - w - bleed
  const maxY = viewport.y + viewport.h - h - bleed
  const x = Math.min(Math.max(Math.round(rect.x), minX), Math.round(maxX))
  const y = Math.min(Math.max(Math.round(rect.y), minY), Math.round(maxY))
  return { x, y, w: Math.round(w), h: Math.round(h) }
}
