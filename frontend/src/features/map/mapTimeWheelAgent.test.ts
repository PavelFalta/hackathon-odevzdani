import { describe, expect, it } from 'vitest'
import { parseMapTimeArgs } from './mapTimeWheelAgent'

describe('parseMapTimeArgs', () => {
  it('parses hour and minute', () => {
    const out = parseMapTimeArgs({ hour: 7, minute: 15 })
    expect(out).toEqual({ minutes: 7 * 60 + 15, readout: '07:15' })
  })

  it('parses HH:MM string', () => {
    const out = parseMapTimeArgs({ time: '18:45' })
    expect(out).toEqual({ minutes: 18 * 60 + 45, readout: '18:45' })
  })

  it('rejects invalid clock', () => {
    expect(parseMapTimeArgs({ hour: 25 })).toEqual({ error: 'time_out_of_range' })
  })
})
