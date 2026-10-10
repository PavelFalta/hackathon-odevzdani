import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MapNavigationControls } from './MapNavigationControls'

const mapZoomIn = vi.fn()
const mapZoomOut = vi.fn()
const mapResetNorthAndPitch = vi.fn()

const mockUseUserLocationOptional = vi.fn(() => null)
const setPerformanceMode = vi.fn()
const setPlaceOrbitEnabled = vi.fn()

vi.mock('./MapContext', () => ({
  useMapController: () => ({
    map: {
      getMaxZoom: () => 18,
      getMinZoom: () => 8,
      getBearing: () => 30,
      getPitch: () => 12,
      getZoom: () => 10,
      on: vi.fn(),
      off: vi.fn(),
    },
    phase: 'ready',
    performanceMode: '3d',
    setPerformanceMode: (...args: unknown[]) => setPerformanceMode(...args),
    placeOrbitEnabled: true,
    setPlaceOrbitEnabled: (...args: unknown[]) => setPlaceOrbitEnabled(...args),
  }),
}))

vi.mock('./userLocation/UserLocationContext', () => ({
  useUserLocationOptional: () => mockUseUserLocationOptional(),
}))

vi.mock('./mapNavigationActions', () => ({
  mapZoomIn: (...args: unknown[]) => mapZoomIn(...args),
  mapZoomOut: (...args: unknown[]) => mapZoomOut(...args),
  mapResetNorthAndPitch: (...args: unknown[]) => mapResetNorthAndPitch(...args),
}))

describe('MapNavigationControls', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    mapZoomIn.mockClear()
    mapZoomOut.mockClear()
    mapResetNorthAndPitch.mockClear()
    setPerformanceMode.mockClear()
    setPlaceOrbitEnabled.mockClear()
    mockUseUserLocationOptional.mockReset()
    mockUseUserLocationOptional.mockReturnValue(null)
  })

  it('renders zoom and compass controls when map is ready', () => {
    render(<MapNavigationControls />)
    expect(screen.getByLabelText('Navigace mapy')).toBeInTheDocument()
    expect(screen.getByLabelText('Přiblížit')).toBeEnabled()
    expect(screen.getByLabelText('Oddálit')).toBeEnabled()
  })

  it('shows my-location control when a fix is known', () => {
    mockUseUserLocationOptional.mockReturnValue({
      fix: { lon: 12.87, lat: 50.23, source: 'gps' },
      autoResolveHint: null,
      resolving: false,
      setFromPlaceQuery: vi.fn(),
    })
    render(<MapNavigationControls />)
    expect(screen.getByLabelText('Přejít na mou polohu')).toBeInTheDocument()
  })

  it('delegates clicks to map navigation actions', () => {
    const { container } = render(<MapNavigationControls />)
    const nav = within(container).getByLabelText('Navigace mapy')
    fireEvent.click(within(nav).getByLabelText('Přiblížit'))
    fireEvent.click(within(nav).getByLabelText('Oddálit'))
    fireEvent.click(within(nav).getByLabelText('Obnovit sever a náklon'))
    expect(mapZoomIn).toHaveBeenCalled()
    expect(mapZoomOut).toHaveBeenCalled()
    expect(mapResetNorthAndPitch).toHaveBeenCalled()
  })

  it('toggles place orbit from the nav stack', () => {
    const { container } = render(<MapNavigationControls />)
    const nav = within(container).getByLabelText('Navigace mapy')
    fireEvent.click(within(nav).getByLabelText('Vypnout otáčení mapy po přiblížení na místo'))
    expect(setPlaceOrbitEnabled).toHaveBeenCalledWith(false)
  })

  it('toggles 2D performance mode from the nav stack', () => {
    const { container } = render(<MapNavigationControls />)
    const nav = within(container).getByLabelText('Navigace mapy')
    fireEvent.click(within(nav).getByLabelText('Přepnout na 2D zobrazení (úspora výkonu)'))
    expect(setPerformanceMode).toHaveBeenCalledWith('2d')
  })
})
