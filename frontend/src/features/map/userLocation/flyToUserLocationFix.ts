import type { Map } from 'mapbox-gl'
import { cinematicFlyTo } from '../mapCinematic'
import { releaseAgentPlaceOrbit } from '../mapPlaceOrbit'

/** Focus the map on the user's saved position. */
export function flyToUserLocationFix(map: Map, lon: number, lat: number): void {
  releaseAgentPlaceOrbit()
  void cinematicFlyTo(map, lon, lat, 15.4)
}
