import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { AssistantProvider } from './AssistantContext'
import { AssistantHub } from './AssistantHub'

vi.mock('./agent/AssistantMapPlacesBridge', () => ({
  AssistantMapPlacesBridge: () => null,
}))

vi.mock('../map/MapContext', () => ({
  useMapController: () => ({
    phase: 'loading',
    map: null,
    bootProgress: 0.2,
    style: { preset: 'night', terrain: true },
    setStyle: vi.fn(),
    performanceMode: '3d',
    setPerformanceMode: vi.fn(),
    placeOrbitEnabled: true,
    setPlaceOrbitEnabled: vi.fn(),
    resetChebView: vi.fn(),
    fitRegion: vi.fn(),
  }),
}))

vi.mock('./hooks/useRealtimeAssistant', () => ({
  useRealtimeAssistant: () => ({
    status: 'ready',
    error: null,
    messages: [],
    turnActivities: [],
    streaming: false,
    busy: false,
    sendMessage: vi.fn(),
    reconnect: vi.fn(),
  }),
}))

afterEach(() => cleanup())

describe('AssistantHub loading', () => {
  it('hides the action menu while the map is loading', () => {
    render(
      <FloatingWindowsProvider>
        <AssistantProvider>
          <AssistantHub onOpenProfile={() => undefined} />
        </AssistantProvider>
      </FloatingWindowsProvider>,
    )
    expect(screen.queryByRole('navigation', { name: /akce asistenta/i })).not.toBeInTheDocument()
  })
})
