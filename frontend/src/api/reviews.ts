import { getBlob, postJson } from './client'

export type ReviewItem = {
  author: string
  rating: number | null
  text: string
  published_at: string | null
}

export type PhotoAttribution = {
  display_name: string
  uri: string | null
}

export type PlacePhoto = {
  name: string
  attributions: PhotoAttribution[]
}

export type ReviewsSearchResponse = {
  place_name: string
  rating: number | null
  rating_count: number | null
  reviews: ReviewItem[]
  photos: PlacePhoto[]
}

export const PHOTO_PANEL_MAX_PX = 800
export const PHOTO_EXPAND_MAX_PX = 1600

const PHOTO_MAX_PX = PHOTO_PANEL_MAX_PX

export function placePhotoMediaPath(photoName: string, maxPx = PHOTO_MAX_PX): string {
  const params = new URLSearchParams({
    name: photoName,
    max_height_px: String(maxPx),
    max_width_px: String(maxPx),
  })
  return `/api/reviews/photos/media?${params.toString()}`
}

export async function fetchPlacePhotoBlob(photoName: string, maxPx = PHOTO_MAX_PX): Promise<Blob> {
  return getBlob(placePhotoMediaPath(photoName, maxPx), true)
}

export async function searchReviews(query: string): Promise<ReviewsSearchResponse> {
  return postJson<ReviewsSearchResponse>('/api/reviews/search', { query }, true)
}
