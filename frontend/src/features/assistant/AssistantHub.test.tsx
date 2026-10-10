import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { MobileDockProvider } from '../shell/MobileDockContext'
import { ShellDock } from '../shell/ShellDock'
import { AssistantProvider } from './AssistantContext'
import { AssistantHub } from './AssistantHub'

vi.mock('./agent/AssistantMapPlacesBridge', () => ({
  AssistantMapPlacesBridge: () => null,
}))

vi.mock('../map/MapContext', () => ({
  useMapController: () => ({
    phase: 'ready',
    map: null,
    bootProgress: 1,
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

vi.mock('./FloatingAssistantTalk', () => ({
  FloatingAssistantTalk: ({ open }: { open: boolean }) =>
    open ? <div data-testid="assistant-talk-orb" /> : null,
}))

function mockTouchMenu() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('AssistantHub', () => {
  beforeEach(() => mockTouchMenu())

  it('opens chat from the bottom menu', async () => {
    const user = userEvent.setup()
    render(
      <FloatingWindowsProvider>
        <MobileDockProvider>
          <AssistantProvider>
            <AssistantHub onOpenProfile={() => undefined} />
            <ShellDock />
          </AssistantProvider>
        </MobileDockProvider>
      </FloatingWindowsProvider>,
    )
    await user.click(screen.getByRole('button', { name: /nabídka asistenta/i }))
    await user.click(screen.getByRole('button', { name: /^psaní$/i }))
    expect(screen.getByTestId('assistant-chat-panel')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: /assistant actions/i })).not.toBeInTheDocument()
  })

  it('opens talk from the bottom menu', async () => {
    const user = userEvent.setup()
    render(
      <FloatingWindowsProvider>
        <MobileDockProvider>
          <AssistantProvider>
            <AssistantHub onOpenProfile={() => undefined} />
            <ShellDock />
          </AssistantProvider>
        </MobileDockProvider>
      </FloatingWindowsProvider>,
    )
    await user.click(screen.getByRole('button', { name: /nabídka asistenta/i }))
    await user.click(screen.getByRole('button', { name: /^hlas$/i }))
    expect(screen.getByTestId('assistant-talk-orb')).toBeInTheDocument()
  })
})
