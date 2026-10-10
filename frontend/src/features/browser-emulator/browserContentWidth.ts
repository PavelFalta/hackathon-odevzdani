import { cornerSlotMaxSize } from '../floating-windows/floatingWindowCorners'
import { defaultBrowserWindowSize } from '../floating-windows/floatingWindowDefaults'
import type { FloatingRect } from '../floating-windows/floatingWindowTypes'

const DEFAULT_DESKTOP_WIDTH = 820
const VIEWPORT_CHROME_PX = 14

export function parseViewportContentWidth(html: string): number | null {
  const meta = html.match(/<meta[^>]+name=["']viewport["'][^>]*content=["']([^"']+)["']/i)
  if (!meta) return null
  const width = meta[1].match(/width\s*=\s*(\d+)/i)
  if (width) return Number(width[1])
  return null
}

export function resolveBrowserPanelWidth(
  contentWidth: number | null | undefined,
  viewport: FloatingRect,
): number {
  const target = contentWidth ?? DEFAULT_DESKTOP_WIDTH
  const maxW = cornerSlotMaxSize(viewport, 'browser').w
  return Math.min(Math.max(300, target + 16), maxW)
}

export function resolveBrowserPanelHeight(
  contentHeight: number | null | undefined,
  viewport: FloatingRect,
  chromeHeight: number,
): number {
  const maxPanel = cornerSlotMaxSize(viewport, 'browser').h
  const fallback = defaultBrowserWindowSize().h
  if (!contentHeight || contentHeight <= 0 || chromeHeight <= 0) {
    return Math.min(fallback, maxPanel)
  }
  const chrome = chromeHeight + VIEWPORT_CHROME_PX
  const contentCap = Math.max(80, maxPanel - chrome)
  const contentSlot = Math.min(contentHeight, contentCap)
  return Math.min(maxPanel, Math.max(100, chrome + contentSlot))
}
