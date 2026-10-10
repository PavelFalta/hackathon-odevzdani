import type { PlacePhoto } from '../../api/reviews'

export function photoAttributionLine(photo: PlacePhoto): string | null {
  const name = photo.attributions.map((a) => a.display_name).find(Boolean)
  return name ?? null
}
