import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MapWorkspace } from './MapWorkspace'

vi.mock('./useMapBootstrap', () => ({
  useMapBootstrap: () => ({
    map: null,
    phase: 'loading',
    bootProgress: 0,
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

describe('MapWorkspace', () => {
  it('boots the map behind the login screen', () => {
    render(
      <MapWorkspace authenticated={false}>
        <p>Login placeholder</p>
      </MapWorkspace>,
    )
    expect(screen.getByTestId('map-fixed-host')).toBeInTheDocument()
    expect(screen.getByTestId('map-canvas')).toBeInTheDocument()
    expect(screen.getByText('Login placeholder')).toBeInTheDocument()
  })
})
