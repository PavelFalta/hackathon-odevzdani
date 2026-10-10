import { describe, expect, it } from 'vitest'
import {
  parseViewportContentWidth,
  resolveBrowserPanelHeight,
  resolveBrowserPanelWidth,
} from './browserContentWidth'

const viewport = { x: 12, y: 60, w: 800, h: 600 }

describe('browserContentWidth', () => {
  it('reads viewport meta width', () => {
    const html = '<meta name="viewport" content="width=390, initial-scale=1">'
    expect(parseViewportContentWidth(html)).toBe(390)
  })

  it('clamps panel width to corner slot', () => {
    const wide = resolveBrowserPanelWidth(1200, viewport)
    expect(wide).toBeLessThan(800 * 0.5)
    expect(wide).toBeGreaterThan(300)
  })

  it('grows panel height with short content and caps tall pages', () => {
    const chrome = 48
    const short = resolveBrowserPanelHeight(120, viewport, chrome)
    expect(short).toBe(chrome + 14 + 120)
    const tall = resolveBrowserPanelHeight(4000, viewport, chrome)
    expect(tall).toBe(Math.floor(600 * 0.4))
  })
})
