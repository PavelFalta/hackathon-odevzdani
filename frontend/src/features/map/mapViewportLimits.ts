import mapboxgl, { type Map } from 'mapbox-gl'
import { KVK_BOUNDS } from './region'

const FIT_PADDING_PX = 40

export function kvkLngLatBounds(): mapboxgl.LngLatBounds {
  return new mapboxgl.LngLatBounds(KVK_BOUNDS[0], KVK_BOUNDS[1])
}

/** Lowest zoom where the full kraj bbox fits in the current viewport (and pitch/bearing). */
export function minZoomForKrajFit(map: Map): number {
  const camera = map.cameraForBounds(kvkLngLatBounds(), {
    padding: FIT_PADDING_PX,
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  })
  const zoom = camera?.zoom
  if (zoom === undefined || Number.isNaN(zoom)) return 8
  return Math.max(0, Math.min(22, zoom))
}

const ZOOM_EPS = 0.001

export function applyKrajViewportLimits(map: Map): void {
  map.setMaxBounds(KVK_BOUNDS)
  const minZ = minZoomForKrajFit(map)
  const currentMin = map.getMinZoom()
  const minRaised = minZ > currentMin + ZOOM_EPS
  if (Math.abs(currentMin - minZ) > ZOOM_EPS) map.setMinZoom(minZ)
  // Only snap zoom when the floor rises (resize / tilt), not after every user zoom gesture.
  if (minRaised) {
    const zoom = map.getZoom()
    if (zoom + ZOOM_EPS < minZ) map.setZoom(minZ)
  }
}

/** Min zoom depends on container size and camera tilt — not on pan/zoom gestures. */
const VIEWPORT_LIMIT_EVENTS = ['resize', 'rotateend', 'pitchend'] as const

/** Keep min zoom in sync when the map container size (or view tilt) changes. */
export function watchKrajViewportLimits(map: Map): () => void {
  const sync = () => applyKrajViewportLimits(map)
  for (const type of VIEWPORT_LIMIT_EVENTS) map.on(type, sync)
  sync()
  return () => {
    for (const type of VIEWPORT_LIMIT_EVENTS) map.off(type, sync)
  }
}
