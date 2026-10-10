import { beforeEach, describe, expect, it, vi } from 'vitest'
import { agentExportRouteScreenshot } from './navigationAgentExport'
import type { NavigationPanel } from './navigationTypes'

const plan = {
  fromLabel: 'A',
  toLabel: 'B',
  fromLon: 12,
  fromLat: 50,
  toLon: 13,
  toLat: 51,
  profile: 'driving' as const,
  distance_m: 1000,
  duration_s: 120,
  steps: [{ instruction: 'Go', distance_m: 1000, duration_s: 120 }],
}

function readyPanel(id: string): NavigationPanel {
  return {
    id,
    request: { destination: 'B' },
    state: { status: 'ready', plan },
  }
}

describe('agentExportRouteScreenshot', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('opens Google Maps before awaiting screenshot capture', async () => {
    const open = vi.fn()
    vi.stubGlobal('open', open)
    const captureOrder: string[] = []
    const { navigationMapCaptureRef } = await import('./navigationMapCaptureRef')
    navigationMapCaptureRef.current = async () => {
      captureOrder.push('capture')
      return new Blob(['x'], { type: 'image/png' })
    }

    const mapsUrl =
      'https://www.google.com/maps/dir/?api=1&origin=50,12&destination=51,13&travelmode=driving'
    const out = await agentExportRouteScreenshot(
      [readyPanel('nav-1')],
      JSON.stringify({ google_maps_url: mapsUrl }),
    )
    const parsed = JSON.parse(out) as { ok: boolean; google_maps_opened: boolean }
    expect(parsed.ok).toBe(true)
    expect(parsed.google_maps_opened).toBe(true)
    expect(open).toHaveBeenCalledWith(mapsUrl, '_blank', 'noopener,noreferrer')
    expect(captureOrder).toEqual(['capture'])
  })
})
