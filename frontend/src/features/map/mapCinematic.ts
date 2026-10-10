import type { Map } from 'mapbox-gl'
import { isNavigationSessionActive } from './mapNavigationSession'
import { PLACE_FOCUS_PITCH, resolvePlaceFocusZoom } from './mapPlaceCamera'

export function cinematicFlyTo(
  map: Map,
  lon: number,
  lat: number,
  zoom?: number,
  bearing?: number,
): Promise<void> {
  const pitch = isNavigationSessionActive() ? 0 : PLACE_FOCUS_PITCH
  const resolvedZoom = resolvePlaceFocusZoom(zoom, pitch)
  return new Promise((resolve) => {
    const onEnd = () => {
      map.off('moveend', onEnd)
      resolve()
    }
    map.once('moveend', onEnd)
    map.flyTo({
      center: [lon, lat],
      zoom: resolvedZoom,
      pitch,
      bearing: bearing ?? map.getBearing(),
      duration: 2800,
      essential: true,
      curve: 1.35,
    })
  })
}
