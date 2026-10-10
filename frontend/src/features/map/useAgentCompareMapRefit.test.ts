import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Map } from 'mapbox-gl'
import { useAgentCompareMapRefit } from './useAgentCompareMapRefit'

const fitMapToAgentPlaces = vi.fn(() => Promise.resolve())
const stopAgentPlaceOrbit = vi.fn()

vi.mock('./mapAgentFitPlaces', () => ({
  fitMapToAgentPlaces: (...args: unknown[]) => fitMapToAgentPlaces(...args),
}))

vi.mock('./mapPlaceOrbit', () => ({
  stopAgentPlaceOrbit: (...args: unknown[]) => stopAgentPlaceOrbit(...args),
}))

let floatingWindows: { id: string }[] = []

vi.mock('../floating-windows/floatingWindowsHooks', () => ({
  useFloatingWindowsState: () => floatingWindows,
}))

vi.mock('./routeFitPadding', () => ({
  computeRouteFitPadding: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

function mockMap(): Map {
  return {
    getCanvas: () => ({ clientWidth: 800, clientHeight: 600 }),
  } as Map
}

describe('useAgentCompareMapRefit', () => {
  beforeEach(() => {
    fitMapToAgentPlaces.mockClear()
    stopAgentPlaceOrbit.mockClear()
    floatingWindows = []
  })

  it('stops orbit before refitting compare places when panels change', async () => {
    const map = mockMap()
    const { result, rerender } = renderHook(({ phase }) => useAgentCompareMapRefit(map, phase), {
      initialProps: { phase: 'ready' },
    })

    result.current.setComparePlaces([
      { lon: 12.1, lat: 50.1, label: 'A' },
      { lon: 12.9, lat: 50.2, label: 'B' },
    ])

    floatingWindows = [{ id: 'reviews-1' }]
    rerender({ phase: 'ready' })

    await waitFor(() => expect(fitMapToAgentPlaces).toHaveBeenCalled())
    expect(stopAgentPlaceOrbit).toHaveBeenCalledWith(map)
  })

  it('does not refit after compare places are cleared', async () => {
    const map = mockMap()
    const { result, rerender } = renderHook(({ phase }) => useAgentCompareMapRefit(map, phase), {
      initialProps: { phase: 'ready' },
    })

    result.current.setComparePlaces([
      { lon: 12.1, lat: 50.1, label: 'A' },
      { lon: 12.9, lat: 50.2, label: 'B' },
    ])
    result.current.setComparePlaces(null)

    floatingWindows = [{ id: 'reviews-1' }]
    rerender({ phase: 'ready' })

    await waitFor(() => expect(fitMapToAgentPlaces).not.toHaveBeenCalled())
  })
})
