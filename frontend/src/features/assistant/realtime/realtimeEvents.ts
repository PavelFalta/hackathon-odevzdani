import type {
  RealtimeOutputItem,
  RealtimeResponsePayload,
  RealtimeServerEvent,
} from './realtimeTypes'

export function parseServerEvent(raw: string): RealtimeServerEvent | null {
  try {
    return JSON.parse(raw) as RealtimeServerEvent
  } catch {
    return null
  }
}

export function extractFunctionCalls(
  response: RealtimeResponsePayload | undefined,
): RealtimeOutputItem[] {
  if (!response?.output) return []
  return response.output.filter((item) => item.type === 'function_call' && item.call_id)
}

export function userTextEvent(text: string): string {
  return JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: [{ type: 'input_text', text }],
    },
  })
}

export function textResponseEvent(): string {
  return JSON.stringify({
    type: 'response.create',
    response: { output_modalities: ['text'] },
  })
}

const VOICE_GREETING_INSTRUCTIONS =
  'The voice session just started and the user has not spoken yet. Greet them briefly in Czech as Kairos, ' +
  'the map assistant for Karlovarský kraj. Say you are ready to help with places, routes, map views ' +
  '(satellite, terrain), and tips. One or two short sentences only. Do not call tools until the user asks something.'

export function voiceResponseEvent(): string {
  return JSON.stringify({
    type: 'response.create',
    response: { output_modalities: ['audio'] },
  })
}

export function voiceGreetingResponseEvent(): string {
  return JSON.stringify({
    type: 'response.create',
    response: {
      output_modalities: ['audio'],
      instructions: VOICE_GREETING_INSTRUCTIONS,
    },
  })
}

export function functionOutputEvent(callId: string, output: string): string {
  return JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output,
    },
  })
}
