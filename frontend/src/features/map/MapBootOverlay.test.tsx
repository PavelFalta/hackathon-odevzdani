import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseMapController } = vi.hoisted(() => ({
  mockUseMapController: vi.fn(),
}))

vi.mock('./MapContext', () => ({
  useMapController: () => mockUseMapController(),
}))

vi.mock('./MapBootBuildingStrip', () => ({
  MapBootBuildingStrip: () => <div data-testid="map-boot-building-strip" />,
}))

import { MAP_BOOT_QUOTES } from './mapBootQuotes'
import { MapBootOverlay } from './MapBootOverlay'

const baseController = {
  map: null,
  bootProgress: 0.4,
  style: {} as never,
  setStyle: vi.fn(),
  performanceMode: '3d' as const,
  setPerformanceMode: vi.fn(),
  placeOrbitEnabled: true,
  setPlaceOrbitEnabled: vi.fn(),
  resetChebView: vi.fn(),
  fitRegion: vi.fn(),
}

describe('MapBootOverlay', () => {
  beforeEach(() => {
    mockUseMapController.mockReset()
  })

  it('shows the loading screen while the map boots', () => {
    mockUseMapController.mockReturnValue({ ...baseController, phase: 'loading' })
    render(<MapBootOverlay />)
    expect(screen.getByTestId('map-boot-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('map-boot-building-strip')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(MAP_BOOT_QUOTES[0])
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40')
    expect(screen.queryByText('Kairos')).not.toBeInTheDocument()
  })

  it('hides when not loading', () => {
    mockUseMapController.mockReturnValue({ ...baseController, phase: 'panorama' })
    const { container } = render(<MapBootOverlay />)
    expect(container).toBeEmptyDOMElement()
  })
})
