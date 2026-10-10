import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { searchReviews } from '../../api/reviews'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { ReviewsProvider } from './ReviewsContext'
import { FloatingReviewsPanel } from './FloatingReviewsPanel'
import { ReviewsPanelTestOpen } from './ReviewsPanelTestOpen'

vi.mock('../../api/reviews', () => ({
  searchReviews: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderReviews() {
  return render(
    <FloatingWindowsProvider>
      <ReviewsProvider>
        <ReviewsPanelTestOpen query="Boubinský výhled" />
        <FloatingReviewsPanel />
      </ReviewsProvider>
    </FloatingWindowsProvider>,
  )
}

describe('FloatingReviewsPanel', () => {
  it('loads and shows Czech results for agent-opened query', async () => {
    vi.mocked(searchReviews).mockResolvedValue({
      place_name: 'Rozhledna Boubinský výhled',
      rating: 4.7,
      rating_count: 84,
      reviews: [
        { author: 'Pavel', rating: 5, text: 'Skvělé.', published_at: '2024-06-01T00:00:00Z' },
      ],
      photos: [],
    })
    const user = userEvent.setup()
    renderReviews()

    await user.click(screen.getByRole('button', { name: /open reviews for test/i }))

    await waitFor(() => {
      expect(screen.getByText('Rozhledna Boubinský výhled')).toBeInTheDocument()
    })
    expect(screen.getByText(/Skvělé/)).toBeInTheDocument()
    expect(screen.getByText(/84 hodnocení/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /4,7 z 5/i })).toBeInTheDocument()
    expect(document.querySelector('.reviews-panel__reviews-scroll')).toBeTruthy()
  })

  it('closes from the header button', async () => {
    vi.mocked(searchReviews).mockResolvedValue({
      place_name: 'Test',
      rating: 4,
      rating_count: 1,
      reviews: [],
      photos: [],
    })
    const user = userEvent.setup()
    renderReviews()
    await user.click(screen.getByRole('button', { name: /open reviews for test/i }))
    await waitFor(() => expect(screen.getByTestId('reviews-panel')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /zavřít recenze/i }))
    expect(screen.queryByTestId('reviews-panel')).not.toBeInTheDocument()
  })
})
