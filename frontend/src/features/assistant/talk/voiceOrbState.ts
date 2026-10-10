import type { OrbState } from 'orb-ui'

type VoiceOrbContext = {
  playback: 'unknown' | 'playing' | 'stopped'
  userSpeaking: boolean
}

export function initialVoiceOrbContext(): VoiceOrbContext {
  return { playback: 'unknown', userSpeaking: false }
}

export function nextVoiceOrbState(
  eventType: string,
  ctx: VoiceOrbContext,
  current: OrbState,
): { state: OrbState; ctx: VoiceOrbContext } {
  const next = { ...ctx }
  switch (eventType) {
    case 'session.created':
    case 'session.updated':
      return { state: 'listening', ctx: next }
    case 'input_audio_buffer.speech_started':
      next.userSpeaking = true
      return { state: 'listening', ctx: next }
    case 'input_audio_buffer.speech_stopped':
      next.userSpeaking = false
      return {
        state: next.playback === 'playing' ? 'speaking' : 'thinking',
        ctx: next,
      }
    case 'response.created':
      if (!next.userSpeaking && next.playback !== 'playing') {
        return { state: 'thinking', ctx: next }
      }
      return { state: current, ctx: next }
    case 'response.output_audio.delta':
      if (!next.userSpeaking) return { state: 'speaking', ctx: next }
      return { state: current, ctx: next }
    case 'output_audio_buffer.started':
      next.playback = 'playing'
      if (!next.userSpeaking) return { state: 'speaking', ctx: next }
      return { state: current, ctx: next }
    case 'output_audio_buffer.stopped':
    case 'output_audio_buffer.cleared':
      next.playback = 'stopped'
      return { state: 'listening', ctx: next }
    case 'response.done':
    case 'response.cancelled':
      if (current !== 'speaking') return { state: 'listening', ctx: next }
      return { state: current, ctx: next }
    case 'error':
      return { state: 'error', ctx: next }
    default:
      return { state: current, ctx: next }
  }
}
