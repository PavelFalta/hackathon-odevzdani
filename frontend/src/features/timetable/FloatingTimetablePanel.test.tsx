import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchReviews } from '../../api/reviews'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { FloatingReviewsPanel } from '../reviews/FloatingReviewsPanel'
import { ReviewsProvider } from '../reviews/ReviewsContext'
import { FloatingTimetablePanel } from './FloatingTimetablePanel'
import { TimetableProvider, useTimetable } from './TimetableContext'

vi.mock('../../api/reviews', () => ({
  searchReviews: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function OpenSample() {
  const { show } = useTimetable()
  return (
    <button
      type="button"
      onClick={() =>
        show({
          title: 'Víkend',
          days: [
            {
              date: '2026-10-10',
              label: 'Sobota',
              events: [
                {
                  time: '18:00',
                  title: 'Koncert',
                  place: 'Hotel Thermal Karlovy Vary',
                  url: 'https://example.com/koncert',
                },
              ],
            },
          ],
        })
      }
    >
      Otevřít program
    </button>
  )
}

describe('FloatingTimetablePanel', () => {
  it('shows only the days the agent filled in', async () => {
    const user = userEvent.setup()
    render(
      <FloatingWindowsProvider>
        <ReviewsProvider>
          <TimetableProvider>
            <OpenSample />
            <FloatingTimetablePanel />
            <FloatingReviewsPanel />
          </TimetableProvider>
        </ReviewsProvider>
      </FloatingWindowsProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Otevřít program' }))
    expect(screen.getByTestId('timetable-panel')).toBeInTheDocument()
    expect(screen.getByText('Koncert')).toBeInTheDocument()
    expect(screen.getByText('Hotel Thermal Karlovy Vary')).toBeInTheDocument()
    expect(screen.getByText('18:00')).toBeInTheDocument()
    expect(screen.getByText('Sobota')).toBeInTheDocument()
  })

  it('opens reviews for the venue when an event is clicked', async () => {
    vi.mocked(searchReviews).mockResolvedValue({
      place_name: 'Hotel Thermal',
      rating: 4.5,
      rating_count: 10,
      reviews: [{ author: 'A', rating: 5, text: 'Ok', published_at: null }],
      photos: [],
    })
    const user = userEvent.setup()
    render(
      <FloatingWindowsProvider>
        <ReviewsProvider>
          <TimetableProvider>
            <OpenSample />
            <FloatingTimetablePanel />
            <FloatingReviewsPanel />
          </TimetableProvider>
        </ReviewsProvider>
      </FloatingWindowsProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Otevřít program' }))
    await user.click(screen.getByRole('button', { name: 'Koncert' }))
    await waitFor(() => {
      expect(searchReviews).toHaveBeenCalledWith('Koncert Hotel Thermal Karlovy Vary')
    })
    expect(screen.getByTestId('reviews-panel')).toBeInTheDocument()
  })
})
