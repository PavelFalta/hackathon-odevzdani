import { mapSearchForward } from '../../../api/mapSearch'
import { CHEB_CENTER } from '../region'
import { isInKvkBounds } from './userLocationPrecision'
import type { UserLocationFix } from './userLocationTypes'

export type GeocodeUserLocationResult =
  { ok: true; fix: UserLocationFix } | { ok: false; error: 'empty_query' | 'not_found' }

export async function geocodeUserLocationInKvk(query: string): Promise<GeocodeUserLocationResult> {
  const trimmed = query.trim()
  if (!trimmed) return { ok: false, error: 'empty_query' }

  const [nearLon, nearLat] = CHEB_CENTER
  const result = await mapSearchForward({
    query: trimmed,
    limit: 8,
    near_lon: nearLon,
    near_lat: nearLat,
    types: 'address,place,poi',
  })

  const hit = result.hits.find((h) => isInKvkBounds(h.lon, h.lat))
  if (!hit) return { ok: false, error: 'not_found' }

  return {
    ok: true,
    fix: {
      lon: hit.lon,
      lat: hit.lat,
      source: 'manual',
      label: hit.full_address ?? hit.name,
    },
  }
}
