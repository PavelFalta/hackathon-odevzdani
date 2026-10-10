import { describe, expect, it } from 'vitest'
import { defaultCustomRange, toInputDate } from './adminPeriod'

describe('adminPeriod', () => {
  it('defaultCustomRange spans 30 days', () => {
    const { from, to } = defaultCustomRange()
    const start = new Date(`${from}T12:00:00`)
    const end = new Date(`${to}T12:00:00`)
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    expect(diff).toBe(29)
  })

  it('toInputDate pads month and day', () => {
    expect(toInputDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})
