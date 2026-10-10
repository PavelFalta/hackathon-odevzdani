import { KVK_BOUNDS } from '../region'

/** Horizontal accuracy (m) below which browser GPS is treated as precise enough. */
export const USER_LOCATION_MAX_ACCURACY_M = 150

export function isGeolocationPreciseEnough(accuracyM: number): boolean {
  return Number.isFinite(accuracyM) && accuracyM > 0 && accuracyM <= USER_LOCATION_MAX_ACCURACY_M
}

export function isInKvkBounds(lon: number, lat: number): boolean {
  const [sw, ne] = KVK_BOUNDS
  return lon >= sw[0] && lon <= ne[0] && lat >= sw[1] && lat <= ne[1]
}
