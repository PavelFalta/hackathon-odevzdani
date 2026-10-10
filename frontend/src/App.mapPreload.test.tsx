import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider } from './features/auth/AuthContext'
import App from './App'

vi.mock('./features/shaders/ShaderBackdrop', () => ({
  ShaderBackdrop: () => null,
}))

vi.mock('./features/map/useMapBootstrap', () => ({
  useMapBootstrap: () => ({
    map: null,
    phase: 'loading',
    bootProgress: 0,
    style: {} as never,
    setStyle: vi.fn(),
    performanceMode: '3d',
    setPerformanceMode: vi.fn(),
    placeOrbitEnabled: true,
    setPlaceOrbitEnabled: vi.fn(),
    resetChebView: vi.fn(),
    fitRegion: vi.fn(),
  }),
}))

describe('App map preload', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_MAPBOX_TOKEN', 'pk.test')
  })

  it('starts map boot on the login screen', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    )
    expect(await screen.findByRole('heading', { name: /^kairos$/i })).toBeInTheDocument()
    expect(screen.getByTestId('map-fixed-host')).toBeInTheDocument()
  })
})
