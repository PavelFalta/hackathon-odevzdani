import { describe, expect, it } from 'vitest'
import { voiceEventClearsToolActivity } from './voiceTalkToolActivity'

describe('voiceTalkToolActivity', () => {
  it('clears tool caption when assistant audio starts', () => {
    expect(voiceEventClearsToolActivity({ type: 'response.output_audio.delta' })).toBe(true)
    expect(voiceEventClearsToolActivity({ type: 'response.created' })).toBe(false)
  })
})
