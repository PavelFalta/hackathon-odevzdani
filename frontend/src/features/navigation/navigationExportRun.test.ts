import { describe, expect, it } from 'vitest'
import { findReadyNavigationPlan } from './navigationExportRun'
import type { NavigationPanel } from './navigationTypes'

const plan = {
  profile: 'driving' as const,
  distance_m: 1000,
  duration_s: 120,
  geometry: {
    type: 'LineString' as const,
    coordinates: [
      [12, 50],
      [12.1, 50.1],
    ],
  },
  steps: [],
  fromLabel: 'A',
  toLabel: 'B',
  fromLon: 12,
  fromLat: 50,
  toLon: 12.1,
  toLat: 50.1,
}

describe('findReadyNavigationPlan', () => {
  it('picks latest ready panel or matches window_id', () => {
    const panels: NavigationPanel[] = [
      { id: 'nav-1', request: { destination: 'B' }, state: { status: 'loading' } },
      {
        id: 'nav-2',
        request: { destination: 'B' },
        state: { status: 'ready', plan },
      },
    ]
    expect(findReadyNavigationPlan(panels)?.panelId).toBe('nav-2')
    expect(findReadyNavigationPlan(panels, 'nav-2')?.plan.toLabel).toBe('B')
    expect(findReadyNavigationPlan(panels, 'nav-1')).toBeNull()
  })
})
