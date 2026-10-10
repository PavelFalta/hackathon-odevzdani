import type { PaddingOptions } from 'mapbox-gl'
import type { FloatingWindowRecord } from '../floating-windows/floatingWindowTypes'
import { readMobileMapBottomInsetPx } from '../shell/mapMobileDockInset'

/** Tight horizontal padding so the route spans the visible map width; reserve space for panels. */
export function computeRouteFitPadding(
  mapWidth: number,
  mapHeight: number,
  windows: FloatingWindowRecord[],
): PaddingOptions {
  const horizMin = 12
  const vert = Math.max(36, Math.round(mapHeight * 0.1))
  const maxBottom = Math.max(vert, Math.round(mapHeight * 0.38))
  const mobileDockBottom = readMobileMapBottomInsetPx()
  if (mobileDockBottom > 0) {
    return {
      top: vert,
      bottom: Math.min(maxBottom, Math.max(vert, mobileDockBottom + 16)),
      left: horizMin,
      right: horizMin,
    }
  }
  let left = horizMin
  let right = horizMin

  for (const win of windows) {
    if (win.kind === 'assistant') continue
    const { x, y, w, h } = win.rect
    const cx = x + w / 2
    if (cx > mapWidth * 0.5) {
      right = Math.max(right, Math.round(mapWidth - x + 12))
    } else {
      left = Math.max(left, Math.round(x + w + 12))
    }
    if (win.kind === 'navigation') {
      if (cx > mapWidth * 0.5) {
        right = Math.max(right, Math.round(w + 24))
      }
    }
    void y
    void h
  }

  return { top: vert, bottom: vert, left, right }
}

/** Stable key for debouncing map refits when panels move or resize. */
export function routeFitPaddingKey(
  mapWidth: number,
  mapHeight: number,
  windows: FloatingWindowRecord[],
): string {
  const padding = computeRouteFitPadding(mapWidth, mapHeight, windows)
  return `${padding.top}:${padding.bottom}:${padding.left}:${padding.right}`
}
