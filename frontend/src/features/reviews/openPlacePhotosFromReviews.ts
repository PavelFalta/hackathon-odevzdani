import type { ReviewsSearchResponse } from '../../api/reviews'
import type { OpenPlacePhotosInput } from './PlacePhotosContext'

export function reviewsToPlacePhotosInput(data: ReviewsSearchResponse): OpenPlacePhotosInput {
  return {
    placeName: data.place_name || 'Místo',
    rating: data.rating,
    ratingCount: data.rating_count,
    photos: data.photos,
  }
}

export function hasPlacePhotos(data: ReviewsSearchResponse): boolean {
  return data.photos.length > 0
}
