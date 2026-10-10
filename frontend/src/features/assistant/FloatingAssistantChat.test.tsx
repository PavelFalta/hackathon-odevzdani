import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { MobileDockProvider } from '../shell/MobileDockContext'
import { ShellDock } from '../shell/ShellDock'
import { AssistantProvider } from './AssistantContext'
import { FloatingAssistantChat } from './FloatingAssistantChat'

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

function renderChat(open = true) {
  const onClose = vi.fn()
  const view = render(
    <FloatingWindowsProvider>
      <MobileDockProvider>
        <AssistantProvider>
          <FloatingAssistantChat open={open} onClose={onClose} />
          <ShellDock />
        </AssistantProvider>
      </MobileDockProvider>
    </FloatingWindowsProvider>,
  )
  return { ...view, onClose }
}

afterEach(() => cleanup())

describe('FloatingAssistantChat', () => {
  it('renders panel when open and collapses on close', async () => {
    const user = userEvent.setup()
    const { onClose } = renderChat(true)
    expect(screen.getByTestId('assistant-chat-panel')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /sbalit chat asistenta/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders nothing when closed', () => {
    renderChat(false)
    expect(screen.queryByTestId('assistant-chat-panel')).not.toBeInTheDocument()
  })
})
