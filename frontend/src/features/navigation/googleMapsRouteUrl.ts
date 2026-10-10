import type { RouteProfile } from '../../api/mapDirections'

function travelMode(profile: RouteProfile): string {
  switch (profile) {
    case 'walking':
      return 'walking'
    case 'cycling':
      return 'bicycling'
    default:
      return 'driving'
  }
}

export function buildGoogleMapsRouteUrl(input: {
  fromLat: number
  fromLon: number
  toLat: number
  toLon: number
  profile: RouteProfile
}): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${input.fromLat},${input.fromLon}`,
    destination: `${input.toLat},${input.toLon}`,
    travelmode: travelMode(input.profile),
  })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
