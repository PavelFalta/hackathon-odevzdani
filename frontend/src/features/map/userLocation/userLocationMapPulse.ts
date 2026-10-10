import type { Map } from 'mapbox-gl'
import { USER_LOCATION_MAP_RADII, USER_LOCATION_LAYER_IDS } from './userLocationMapMarkerConfig'

let rafId: number | null = null
let activeMap: Map | null = null
let phase = 0

function tick() {
  const map = activeMap
  if (!map?.getLayer(USER_LOCATION_LAYER_IDS.pulse)) {
    rafId = null
    return
  }
  phase += 0.07
  const wave = 0.5 + 0.5 * Math.sin(phase)
  const pulseScale = 1 + 0.85 * wave
  const haloOpacity = 0.38 + 0.32 * wave

  map.setPaintProperty(
    USER_LOCATION_LAYER_IDS.pulse,
    'circle-radius',
    USER_LOCATION_MAP_RADII.pulse * pulseScale,
  )
  map.setPaintProperty(USER_LOCATION_LAYER_IDS.pulse, 'circle-opacity', 0.42 + 0.38 * wave)
  if (map.getLayer(USER_LOCATION_LAYER_IDS.halo)) {
    map.setPaintProperty(USER_LOCATION_LAYER_IDS.halo, 'circle-opacity', haloOpacity)
    map.setPaintProperty(
      USER_LOCATION_LAYER_IDS.halo,
      'circle-radius',
      USER_LOCATION_MAP_RADII.halo * (0.92 + 0.12 * wave),
    )
  }
  rafId = window.requestAnimationFrame(tick)
}

export function startUserLocationMapPulse(map: Map) {
  if (activeMap === map && rafId !== null) return
  stopUserLocationMapPulse()
  activeMap = map
  rafId = window.requestAnimationFrame(tick)
}

export function stopUserLocationMapPulse() {
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  rafId = null
  activeMap = null
  phase = 0
}
