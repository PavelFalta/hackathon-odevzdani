import { describe, expect, it, vi } from 'vitest'
import { initialVoiceOrbContext } from './voiceOrbState'
import { processVoiceServerMessage } from './processVoiceServerMessage'

describe('processVoiceServerMessage', () => {
  it('sends greeting once on session.created', async () => {
    const send = vi.fn()
    const channel = { send, readyState: 'open' }
    const greetingSentRef = { current: false }
    const deps = {
      channel,
      orbContextRef: { current: initialVoiceOrbContext() },
      greetingSentRef,
      setState: vi.fn(),
      getState: () => 'listening' as const,
      setError: vi.fn(),
    }

    await processVoiceServerMessage(JSON.stringify({ type: 'session.created' }), deps)
    expect(send).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(send.mock.calls[0][0] as string) as {
      type: string
      response: { instructions: string }
    }
    expect(payload.type).toBe('response.create')
    expect(payload.response.instructions).toContain('Kairos')

    await processVoiceServerMessage(JSON.stringify({ type: 'session.created' }), deps)
    expect(send).toHaveBeenCalledTimes(1)
  })
})
