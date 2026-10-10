import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickKairosWaveDelayMs } from './kairosWordmarkWaveSchedule'

describe('kairosWordmarkWaveSchedule', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('picks delay within the configured window', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(pickKairosWaveDelayMs()).toBe(9000)
    vi.spyOn(Math, 'random').mockReturnValue(1)
    expect(pickKairosWaveDelayMs()).toBe(22000)
  })
})
