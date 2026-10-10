import { parseServerEvent } from '../realtime/realtimeEvents'
import type { RealtimeServerEvent } from '../realtime/realtimeTypes'

const TOOL_ACTIVITY_CLEAR_EVENTS = new Set([
  'response.output_audio.delta',
  'output_audio_buffer.started',
  'input_audio_buffer.speech_started',
  'response.cancelled',
])

export function voiceEventClearsToolActivity(event: RealtimeServerEvent): boolean {
  return TOOL_ACTIVITY_CLEAR_EVENTS.has(event.type)
}

export function parseVoiceServerEvent(raw: string): RealtimeServerEvent | null {
  return parseServerEvent(raw)
}
