import { fetchMapDirections } from '../../api/mapDirections'
import { mapSearchForward } from '../../api/mapSearch'
import type { NavigationPlan, NavigationRouteRequest } from './navigationTypes'

type UserLocationSnapshot = {
  has_fix?: boolean
  lon?: number | null
  lat?: number | null
  label?: string | null
}

async function geocodePlace(query: string): Promise<{ lon: number; lat: number; label: string }> {
  const data = await mapSearchForward({ query, limit: 1 })
  const hit = data.hits[0]
  if (!hit) throw new Error(`Místo „${query}" se na mapě nenašlo.`)
  const label = hit.full_address ? `${hit.name}, ${hit.full_address}` : hit.name
  return { lon: hit.lon, lat: hit.lat, label }
}

async function resolveOrigin(
  request: NavigationRouteRequest,
  getUserLocation: () => Promise<string>,
): Promise<{ lon: number; lat: number; label: string }> {
  if (request.fromLon !== undefined && request.fromLat !== undefined) {
    return {
      lon: request.fromLon,
      lat: request.fromLat,
      label: request.fromName?.trim() || request.origin?.trim() || 'Výchozí bod',
    }
  }
  if (request.useUserLocation) {
    const raw = await getUserLocation()
    const snap = JSON.parse(raw) as UserLocationSnapshot
    if (snap.has_fix && snap.lon != null && snap.lat != null) {
      return {
        lon: snap.lon,
        lat: snap.lat,
        label: snap.label?.trim() || 'Tvoje poloha',
      }
    }
    throw new Error(
      'Poloha uživatele není nastavená — nastav ji v aplikaci nebo zadej výchozí bod.',
    )
  }
  const originQuery = request.origin?.trim()
  if (!originQuery) {
    const raw = await getUserLocation()
    const snap = JSON.parse(raw) as UserLocationSnapshot
    if (snap.has_fix && snap.lon != null && snap.lat != null) {
      return {
        lon: snap.lon,
        lat: snap.lat,
        label: snap.label?.trim() || 'Tvoje poloha',
      }
    }
    throw new Error(
      'Poloha uživatele není nastavená — nastav ji v aplikaci nebo zadej výchozí bod.',
    )
  }
  return geocodePlace(originQuery)
}

async function resolveDestination(
  request: NavigationRouteRequest,
): Promise<{ lon: number; lat: number; label: string }> {
  if (request.toLon !== undefined && request.toLat !== undefined) {
    return {
      lon: request.toLon,
      lat: request.toLat,
      label: request.toName?.trim() || request.destination.trim(),
    }
  }
  const dest = request.destination.trim()
  if (!dest) throw new Error('Cíl trasy je povinný.')
  return geocodePlace(dest)
}

export async function resolveNavigationPlan(
  request: NavigationRouteRequest,
  getUserLocation: () => Promise<string>,
): Promise<NavigationPlan> {
  const [from, to] = await Promise.all([
    resolveOrigin(request, getUserLocation),
    resolveDestination(request),
  ])
  const profile = request.profile ?? 'driving'
  const route = await fetchMapDirections({
    from_lon: from.lon,
    from_lat: from.lat,
    to_lon: to.lon,
    to_lat: to.lat,
    profile,
  })
  return {
    ...route,
    fromLabel: from.label,
    toLabel: to.label,
    fromLon: from.lon,
    fromLat: from.lat,
    toLon: to.lon,
    toLat: to.lat,
  }
}
