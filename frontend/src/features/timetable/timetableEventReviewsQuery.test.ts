import { describe, expect, it } from 'vitest'
import { timetableEventReviewsQuery } from './timetableEventReviewsQuery'

describe('timetableEventReviewsQuery', () => {
  it('combines title and place when both differ', () => {
    expect(
      timetableEventReviewsQuery({
        title: 'Koncert',
        place: 'Hotel Thermal Karlovy Vary',
        time: null,
        url: null,
      }),
    ).toBe('Koncert Hotel Thermal Karlovy Vary')
  })

  it('avoids duplicating place already in the title', () => {
    expect(
      timetableEventReviewsQuery({
        title: 'Jazz v Chebu',
        place: 'Cheb',
        time: null,
        url: null,
      }),
    ).toBe('Jazz v Chebu')
  })
})
