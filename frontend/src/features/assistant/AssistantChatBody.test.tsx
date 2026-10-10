import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AssistantChatBody } from './AssistantChatBody'

const sendMessage = vi.fn()
let mockStatus: 'ready' | 'connecting' | 'error' = 'ready'
let mockBusy = false

vi.mock('./AssistantContext', () => ({
  useAssistant: () => ({
    setTextSessionEnabled: vi.fn(),
    status: mockStatus,
    error: null,
    messages: [],
    turnActivities: [],
    busy: mockBusy,
    sendMessage,
    reconnect: vi.fn(),
  }),
}))

describe('AssistantChatBody', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    sendMessage.mockClear()
    mockStatus = 'ready'
    mockBusy = false
  })

  it('submits on Enter and clears input', async () => {
    sendMessage.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<AssistantChatBody />)
    const input = screen.getByLabelText(/zeptej se na mapu/i)
    await user.type(input, 'Kde je Karlovy Vary?{Enter}')
    expect(sendMessage).toHaveBeenCalledWith('Kde je Karlovy Vary?')
    expect(input).toHaveValue('')
  })

  it('focuses input when the chat opens', () => {
    render(<AssistantChatBody />)
    expect(screen.getByLabelText(/zeptej se na mapu/i)).toHaveFocus()
  })

  it('allows typing while connecting', () => {
    mockStatus = 'connecting'
    render(<AssistantChatBody />)
    expect(screen.getByLabelText(/zeptej se na mapu/i)).not.toBeDisabled()
  })

  it('focuses input when the assistant finishes a turn', () => {
    mockBusy = true
    const { rerender } = render(<AssistantChatBody />)
    const input = screen.getByLabelText(/zeptej se na mapu/i)
    input.blur()
    mockBusy = false
    rerender(<AssistantChatBody />)
    expect(input).toHaveFocus()
  })

  it('inserts newline on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<AssistantChatBody />)
    const input = screen.getByLabelText(/zeptej se na mapu/i)
    await user.type(input, 'řádek 1')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(input, 'řádek 2')
    expect(input).toHaveValue('řádek 1\nřádek 2')
    expect(sendMessage).not.toHaveBeenCalled()
  })
})
