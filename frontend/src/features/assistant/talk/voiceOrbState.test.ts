import { describe, expect, it } from 'vitest'
import { initialVoiceOrbContext, nextVoiceOrbState } from './voiceOrbState'

describe('voiceOrbState', () => {
  it('enters listening after session is ready', () => {
    const ctx = initialVoiceOrbContext()
    const next = nextVoiceOrbState('session.created', ctx, 'connecting')
    expect(next.state).toBe('listening')
  })

  it('thinks after user stops speaking', () => {
    let ctx = initialVoiceOrbContext()
    let state = 'listening' as const
    const started = nextVoiceOrbState('input_audio_buffer.speech_started', ctx, state)
    ctx = started.ctx
    state = started.state
    const stopped = nextVoiceOrbState('input_audio_buffer.speech_stopped', ctx, state)
    expect(stopped.state).toBe('thinking')
  })
})
