import { describe, expect, it, vi } from 'vitest'
import { computeRouteFitPadding, routeFitPaddingKey } from './routeFitPadding'

describe('computeRouteFitPadding', () => {
  it('adds extra right padding when a panel sits on the right', () => {
    const padding = computeRouteFitPadding(1000, 800, [
      {
        id: 'nav',
        kind: 'navigation',
        label: 'Nav',
        rect: { x: 620, y: 320, w: 360, h: 440 },
        zIndex: 2,
        userStacked: false,
        anchor: 'bottom-right',
      },
    ])
    expect(padding.right).toBeGreaterThan(12)
    expect(padding.left).toBe(12)
    expect(padding.top).toBeGreaterThan(0)
  })

  it('reserves bottom space only while the dock still covers the map', () => {
    const workspace = document.createElement('div')
    workspace.className = 'map-workspace--shell map-workspace--mobile-dock'
    const host = document.createElement('div')
    host.className = 'map-fixed-host'
    workspace.appendChild(host)
    document.body.appendChild(workspace)
    const dockTop = window.innerHeight - Math.round(window.innerHeight * 0.45)
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 400,
      height: window.innerHeight,
      top: 0,
      left: 0,
      right: 400,
      bottom: window.innerHeight,
      toJSON: () => ({}),
    })
    const covered = computeRouteFitPadding(400, window.innerHeight, [])
    expect(covered.bottom).toBeGreaterThan(dockTop * 0.2)

    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 400,
      height: dockTop,
      top: 0,
      left: 0,
      right: 400,
      bottom: dockTop,
      toJSON: () => ({}),
    })
    const inset = computeRouteFitPadding(400, dockTop, [])
    document.body.removeChild(workspace)
    expect(inset.bottom).toBeLessThan(covered.bottom as number)
    expect(inset.bottom).toBeLessThan(dockTop * 0.2)
  })

  it('routeFitPaddingKey ignores assistant windows', () => {
    const base = [
      {
        id: 'nav',
        kind: 'navigation' as const,
        label: 'Nav',
        rect: { x: 620, y: 320, w: 360, h: 440 },
        zIndex: 2,
        userStacked: false,
        anchor: 'bottom-right' as const,
      },
    ]
    const withAssistant = [
      ...base,
      {
        id: 'chat',
        kind: 'assistant' as const,
        label: 'Asistent',
        rect: { x: 40, y: 200, w: 320, h: 480 },
        zIndex: 3,
        userStacked: true,
        anchor: 'bottom-left' as const,
      },
    ]
    expect(routeFitPaddingKey(1000, 800, base)).toBe(routeFitPaddingKey(1000, 800, withAssistant))
  })
})
