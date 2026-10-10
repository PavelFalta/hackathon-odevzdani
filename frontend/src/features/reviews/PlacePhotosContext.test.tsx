import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PlacePhoto } from '../../api/reviews'
import { PlacePhotosProvider, usePlacePhotos } from './PlacePhotosContext'

const photo: PlacePhoto = {
  name: 'places/abc/photos/1',
  widthPx: 100,
  heightPx: 100,
  attributions: [],
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <PlacePhotosProvider>{children}</PlacePhotosProvider>
}

describe('PlacePhotosContext', () => {
  it('does not re-render panels when openForPlace repeats the same payload', () => {
    const { result } = renderHook(() => usePlacePhotos(), { wrapper })
    const input = {
      placeName: 'Burger Bar',
      rating: 4.2,
      ratingCount: 120,
      photos: [photo],
    }

    act(() => {
      result.current.openForPlace(input)
    })
    const panelsAfterFirst = result.current.panels

    act(() => {
      result.current.openForPlace({ ...input, photos: [...input.photos] })
    })

    expect(result.current.panels).toBe(panelsAfterFirst)
  })
})
