import { useRef } from 'react'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapProvider } from './MapContext'
import { MapView } from './MapView'

function MapViewHarness() {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <MapProvider containerRef={containerRef}>
      <MapView />
    </MapProvider>
  )
}

function createMockMapSource() {
  return { setData: vi.fn() }
}

const mockMapSources = new Map<string, ReturnType<typeof createMockMapSource>>()

const mockMap = {
  getMaxZoom: () => 18,
  getMinZoom: () => 8,
  getBearing: () => 0,
  getPitch: () => 0,
  getZoom: () => 10,
  getSource: (id: string) => mockMapSources.get(id),
  getLayer: vi.fn(() => undefined),
  addSource: (id: string) => {
    mockMapSources.set(id, createMockMapSource())
  },
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  once: vi.fn(),
  flyTo: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}

vi.mock('./useMapBootstrap', () => ({
  useMapBootstrap: () => ({
    map: mockMap,
    phase: 'ready',
    style: {
      basemapAppearance: 'standard',
      lightPreset: 'day',
      show3dObjects: true,
      showRoadsAndTransit: true,
      showPlaceLabels: true,
      showPointOfInterestLabels: true,
      showRoadLabels: true,
      showTransitLabels: true,
      terrainExaggeration: 1.45,
    },
    setStyle: vi.fn(),
    performanceMode: '3d',
    setPerformanceMode: vi.fn(),
    placeOrbitEnabled: true,
    setPlaceOrbitEnabled: vi.fn(),
    resetChebView: vi.fn(),
    fitRegion: vi.fn(),
  }),
}))

describe('MapView', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
    mockMapSources.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows unavailable state without Mapbox token', () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', '')
    render(<MapViewHarness />)
    expect(screen.getByTestId('map-unavailable')).toBeInTheDocument()
  })

  it('renders map chrome when token is set', () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'pk.test')
    render(<MapViewHarness />)
    expect(screen.getByLabelText('Navigace mapy')).toBeInTheDocument()
  })

  it('passes pointer events through map shell to the fixed map host', () => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'pk.test')
    const { container } = render(<MapViewHarness />)
    const shell = container.querySelector('.map-shell')
    expect(shell).toBeTruthy()
    expect(shell).toHaveStyle({ pointerEvents: 'none' })
    const scoped = within(shell as HTMLElement)
    expect(scoped.queryByLabelText('Čas na mapě')).not.toBeInTheDocument()
    expect(scoped.getByLabelText('Navigace mapy')).toHaveStyle({ pointerEvents: 'auto' })
  })
})
