import { describe, expect, it } from 'vitest'
import { calendarSnapshotText } from './calendarSnapshot'

describe('calendarSnapshotText', () => {
  it('resolves this weekend from a Friday in Prague', () => {
    const text = calendarSnapshotText(new Date('2026-10-09T12:00:00+02:00'))
    expect(text).toContain('today is 2026-10-09 (Friday)')
    expect(text).toContain('This weekend is 2026-10-10 (Saturday) through 2026-10-11 (Sunday)')
    expect(text).toContain('Next weekend is 2026-10-17 through 2026-10-18')
  })

  it('keeps Saturday as the start when today is Saturday', () => {
    const text = calendarSnapshotText(new Date('2026-10-10T08:00:00+02:00'))
    expect(text).toContain('today is 2026-10-10 (Saturday)')
    expect(text).toContain('This weekend is 2026-10-10 (Saturday) through 2026-10-11 (Sunday)')
  })

  it('marks Saturday as past on Sunday', () => {
    const text = calendarSnapshotText(new Date('2026-10-11T15:00:00+02:00'))
    expect(text).toContain('Saturday of this weekend has already passed')
    expect(text).toContain('Next weekend is 2026-10-17 through 2026-10-18')
  })
})
