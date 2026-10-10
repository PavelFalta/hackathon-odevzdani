import { isGeolocationPreciseEnough, isInKvkBounds } from './userLocationPrecision'
import { requestBrowserGeolocation } from './requestBrowserGeolocation'
import type { UserLocationFix, UserLocationInputReason } from './userLocationTypes'

const GPS_TIMEOUT_MS = 12_000

export type GpsResolveResult =
  | { status: 'ok'; fix: UserLocationFix }
  | { status: 'needs_input'; reason: UserLocationInputReason }

export async function resolveGpsUserLocation(): Promise<GpsResolveResult> {
  const outcome = await requestBrowserGeolocation(GPS_TIMEOUT_MS)
  if (!outcome.ok) {
    if (outcome.reason === 'denied') return { status: 'needs_input', reason: 'denied' }
    return { status: 'needs_input', reason: 'unavailable' }
  }

  if (!isGeolocationPreciseEnough(outcome.accuracyM)) {
    return { status: 'needs_input', reason: 'imprecise' }
  }

  if (!isInKvkBounds(outcome.lon, outcome.lat)) {
    return { status: 'needs_input', reason: 'out_of_region' }
  }

  return {
    status: 'ok',
    fix: { lon: outcome.lon, lat: outcome.lat, source: 'gps' },
  }
}
