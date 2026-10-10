import { describe, expect, it } from 'vitest'
import { parseTimetablePayload } from './parseTimetablePayload'

describe('parseTimetablePayload', () => {
  it('keeps only days that have titled events', () => {
    const board = parseTimetablePayload(
      JSON.stringify({
        title: 'Víkend',
        days: [
          {
            date: '2026-10-11',
            label: 'Neděle',
            events: [{ time: '11:00', title: 'Trh', place: 'Cheb' }],
          },
          { date: '2026-10-10', events: [{ title: 'Koncert', url: 'notaurl' }] },
          { date: '2026-10-12', events: [{ title: '' }] },
        ],
      }),
    )
    expect(board).toMatchObject({
      title: 'Víkend',
      days: [
        { date: '2026-10-10', events: [{ title: 'Koncert', url: null }] },
        { date: '2026-10-11', label: 'Neděle', events: [{ time: '11:00', title: 'Trh' }] },
      ],
    })
  })

  it('rejects an empty program', () => {
    expect(parseTimetablePayload(JSON.stringify({ days: [] }))).toEqual({ error: 'no_events' })
  })
})
