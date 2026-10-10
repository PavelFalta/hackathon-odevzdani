import type { Map } from 'mapbox-gl'
import { isNavigationSessionActive } from './mapNavigationSession'

/** Mapbox normalizes bearing, so a single ±360° ease does not animate. */
export const ORBIT_BEARING_STEP_DEG = 18
export const ORBIT_STEP_MS = 1800

let orbitSession = 0
let orbitActiveSession: number | null = null
let nextOrbitDirection: 1 | -1 = 1
let orbitMap: Map | null = null

export function bindAgentPlaceOrbitMap(map: Map | null) {
  orbitMap = map
}

export function releaseAgentPlaceOrbit() {
  if (!orbitMap) return
  stopAgentPlaceOrbit(orbitMap)
}

/** Stops agent orbit only — does not call `map.stop()` when the user is already in control. */
export function stopAgentPlaceOrbit(map: Map) {
  if (orbitActiveSession === null) return
  orbitActiveSession = null
  orbitSession += 1
  map.stop()
}

export function startAgentPlaceOrbit(map: Map, lon: number, lat: number) {
  if (isNavigationSessionActive()) return
  stopAgentPlaceOrbit(map)
  const session = ++orbitSession
  orbitActiveSession = session
  const direction = nextOrbitDirection
  nextOrbitDirection = direction === 1 ? -1 : 1

  const step = () => {
    if (session !== orbitSession) {
      if (orbitActiveSession === session) orbitActiveSession = null
      return
    }
    map.easeTo({
      center: [lon, lat],
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing() + ORBIT_BEARING_STEP_DEG * direction,
      duration: ORBIT_STEP_MS,
      easing: (t) => t,
      essential: true,
    })
    map.once('moveend', step)
  }

  step()
}

/** @internal Vitest only */
export function resetAgentPlaceOrbitDirectionForTests() {
  nextOrbitDirection = 1
  orbitSession = 0
  orbitActiveSession = null
}
