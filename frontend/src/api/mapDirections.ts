import { postJson } from './client'

export type RouteProfile = 'driving' | 'walking' | 'cycling'

export type DirectionsStep = {
  instruction: string
  distance_m: number
  duration_s: number
  name: string | null
}

export type RouteLineGeometry = {
  type: 'LineString'
  coordinates: [number, number][]
}

export type DirectionsResponse = {
  profile: RouteProfile
  distance_m: number
  duration_s: number
  geometry: RouteLineGeometry
  steps: DirectionsStep[]
}

export async function fetchMapDirections(body: {
  from_lon: number
  from_lat: number
  to_lon: number
  to_lat: number
  profile?: RouteProfile
}): Promise<DirectionsResponse> {
  return postJson<DirectionsResponse>('/api/map/directions', body, true)
}
