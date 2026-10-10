import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PlacePhotosCarousel } from './PlacePhotosCarousel'

vi.mock('../../api/reviews', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/reviews')>()
  return {
    ...actual,
    fetchPlacePhotoBlob: vi.fn().mockResolvedValue(new Blob(['x'], { type: 'image/jpeg' })),
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const photos = [
  {
    name: 'places/ChIJxxx/photos/A',
    attributions: [{ display_name: 'Jan', uri: null }],
  },
  {
    name: 'places/ChIJxxx/photos/B',
    attributions: [{ display_name: 'Marie', uri: null }],
  },
]

describe('PlacePhotosCarousel', () => {
  it('steps with overlay controls', async () => {
    const user = userEvent.setup()
    render(<PlacePhotosCarousel placeName="Rozhledna" photos={photos} />)

    expect(screen.queryByRole('button', { name: /předchozí/i })).not.toBeInTheDocument()
    const next = screen.getByRole('button', { name: /další fotografie/i })
    expect(next).toBeInTheDocument()

    await user.click(next)
    expect(screen.getByRole('button', { name: /předchozí fotografie/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /další fotografie/i })).not.toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })

  it('opens expand modal from the panel', async () => {
    const user = userEvent.setup()
    render(<PlacePhotosCarousel placeName="Rozhledna" photos={photos} />)

    const img = await screen.findByAltText(/Rozhledna — 1\. fotografie/i)
    fireEvent.load(img)
    await user.click(await screen.findByRole('button', { name: /zvětšit fotografii/i }))
    expect(screen.getByTestId('place-photo-expand')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
