import type { Map } from 'mapbox-gl'
import { releaseAgentPlaceOrbit } from './mapPlaceOrbit'

const ZOOM_MS = 280
const RESET_MS = 480

export function mapZoomIn(map: Map): void {
  releaseAgentPlaceOrbit()
  map.zoomIn({ duration: ZOOM_MS })
}

export function mapZoomOut(map: Map): void {
  releaseAgentPlaceOrbit()
  map.zoomOut({ duration: ZOOM_MS })
}

/** Matches Mapbox NavigationControl with `visualizePitch: true`. */
export function mapResetNorthAndPitch(map: Map): void {
  releaseAgentPlaceOrbit()
  map.resetNorthPitch({ duration: RESET_MS })
}
