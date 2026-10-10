import { describe, expect, it } from 'vitest'
import { initialTalkOrbSignal, mergeTalkOrbSignal, normalizeInputLevel } from './talkOrbSignal'

describe('talkOrbSignal', () => {
  it('zeros meters when idle', () => {
    const next = mergeTalkOrbSignal(
      { ...initialTalkOrbSignal(), inputVolume: 0.8, outputVolume: 0.5 },
      { state: 'idle' },
    )
    expect(next.inputVolume).toBe(0)
    expect(next.outputVolume).toBe(0)
  })

  it('keeps volume updates while listening', () => {
    const next = mergeTalkOrbSignal(
      { ...initialTalkOrbSignal(), state: 'listening', inputVolume: 0, outputVolume: 0 },
      { inputVolume: 0.42 },
    )
    expect(next.state).toBe('listening')
    expect(next.inputVolume).toBe(0.42)
  })

  it('normalizes mic levels into 0-1 range', () => {
    expect(normalizeInputLevel(0)).toBeGreaterThanOrEqual(0)
    expect(normalizeInputLevel(0.2)).toBeLessThanOrEqual(1)
  })
})
