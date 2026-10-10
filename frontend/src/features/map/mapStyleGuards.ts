import type { Map } from 'mapbox-gl'

/** Mapbox throws if getLayer runs while style is missing (resize, teardown, reload). */
export function isMapStyleReady(map: Map): boolean {
  try {
    return map.isStyleLoaded()
  } catch {
    return false
  }
}

export function mapHasLayer(map: Map, layerId: string): boolean {
  if (!isMapStyleReady(map)) return false
  try {
    return Boolean(map.getLayer(layerId))
  } catch {
    return false
  }
}
