import mapboxgl, { type Map, type PaddingOptions } from 'mapbox-gl'
import { mapBearingForRouteLeftToRight } from './routeMapBearing'
import type { MapRouteDisplay } from './mapAgentRouteLayer'
import { ROUTE_FIT_MAX_ZOOM, tightenRouteFitZoom } from './routeMapFitZoom'

const FIT_MS = 1400

function routeBounds(route: MapRouteDisplay): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds()
  for (const coord of route.geometry.coordinates) {
    bounds.extend(coord as [number, number])
  }
  bounds.extend([route.fromLon, route.fromLat])
  bounds.extend([route.toLon, route.toLat])
  return bounds
}

function startIsLeftOfEnd(map: Map, route: MapRouteDisplay): boolean {
  const start = map.project([route.fromLon, route.fromLat])
  const end = map.project([route.toLon, route.toLat])
  return start.x < end.x
}

function easeToCamera(
  map: Map,
  bounds: mapboxgl.LngLatBounds,
  padding: PaddingOptions,
  bearing: number,
): Promise<void> {
  const camera = map.cameraForBounds(bounds, {
    padding,
    bearing,
    pitch: 0,
    maxZoom: ROUTE_FIT_MAX_ZOOM,
  })
  if (!camera) return Promise.resolve()
  const zoom = Math.min(camera.zoom ?? map.getZoom(), ROUTE_FIT_MAX_ZOOM)
  return new Promise((resolve) => {
    map.once('moveend', () => resolve())
    map.easeTo({
      center: camera.center,
      zoom,
      bearing,
      pitch: 0,
      duration: FIT_MS,
      essential: true,
    })
  })
}

export async function fitMapToRoute(
  map: Map,
  route: MapRouteDisplay,
  padding: PaddingOptions,
): Promise<number> {
  const bounds = routeBounds(route)
  if (bounds.isEmpty()) return map.getBearing()

  let bearing = mapBearingForRouteLeftToRight(
    route.fromLon,
    route.fromLat,
    route.toLon,
    route.toLat,
  )
  await easeToCamera(map, bounds, padding, bearing)
  if (!startIsLeftOfEnd(map, route)) {
    bearing += 180
    await easeToCamera(map, bounds, padding, bearing)
  }
  tightenRouteFitZoom(map, route, padding)
  return bearing
}
