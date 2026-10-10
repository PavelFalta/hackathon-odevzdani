import type { Map } from 'mapbox-gl'
import { releaseAgentPlaceOrbit } from './mapPlaceOrbit'

let sessionDepth = 0

export function isNavigationSessionActive(): boolean {
  return sessionDepth > 0
}

/** Stops agent orbit only — manual map rotation stays enabled. */
export function setNavigationSessionActive(_map: Map, active: boolean): void {
  if (active) {
    if (sessionDepth === 0) {
      releaseAgentPlaceOrbit()
    }
    sessionDepth += 1
    return
  }
  if (sessionDepth === 0) return
  sessionDepth -= 1
}

/** @internal Vitest only */
export function resetNavigationSessionForTests(): void {
  sessionDepth = 0
}
