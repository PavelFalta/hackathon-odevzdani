import { describe, expect, it } from 'vitest'
import {
  extractFunctionCalls,
  parseServerEvent,
  userTextEvent,
  voiceGreetingResponseEvent,
  voiceResponseEvent,
} from './realtimeEvents'

describe('realtimeEvents', () => {
  it('parses server events', () => {
    const event = parseServerEvent('{"type":"session.created"}')
    expect(event?.type).toBe('session.created')
  })

  it('builds user text client events', () => {
    const payload = JSON.parse(userTextEvent('ahoj')) as {
      item: { content: { text: string }[] }
    }
    expect(payload.item.content[0].text).toBe('ahoj')
  })

  it('extracts function calls from response.done payload', () => {
    const calls = extractFunctionCalls({
      output: [
        { type: 'function_call', call_id: 'c1', name: 'search_regional_knowledge' },
        { type: 'message' },
      ],
    })
    expect(calls).toHaveLength(1)
    expect(calls[0].name).toBe('search_regional_knowledge')
  })

  it('builds voice continuation events', () => {
    const payload = JSON.parse(voiceResponseEvent()) as {
      response: { output_modalities: string[] }
    }
    expect(payload.response.output_modalities).toEqual(['audio'])
  })

  it('builds voice greeting with instructions', () => {
    const payload = JSON.parse(voiceGreetingResponseEvent()) as {
      response: { output_modalities: string[]; instructions: string }
    }
    expect(payload.response.output_modalities).toEqual(['audio'])
    expect(payload.response.instructions).toContain('Kairos')
    expect(payload.response.instructions).toContain('Czech')
  })
})
