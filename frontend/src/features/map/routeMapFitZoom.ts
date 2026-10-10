import type { Map, PaddingOptions } from 'mapbox-gl'
import { zoomBumpForPlaceSpan } from './mapAgentFitPlaces'
import type { MapRouteDisplay } from './mapAgentRouteLayer'

export const ROUTE_FIT_MAX_ZOOM = 18

function horizontalPadding(padding: PaddingOptions): number {
  if (typeof padding === 'number') return padding * 2
  return (padding.left ?? 0) + (padding.right ?? 0)
}

function verticalPadding(padding: PaddingOptions): number {
  if (typeof padding === 'number') return padding * 2
  return (padding.top ?? 0) + (padding.bottom ?? 0)
}

export function minZoomForShortRoute(distanceM: number | undefined): number | null {
  if (distanceM === undefined || distanceM > 550) return null
  if (distanceM < 120) return 17.4
  if (distanceM < 280) return 16.8
  return 16.2
}

export function tightenRouteFitZoom(
  map: Map,
  route: MapRouteDisplay,
  padding: PaddingOptions,
): void {
  const canvas = map.getCanvas()
  const usableW = canvas.clientWidth - horizontalPadding(padding)
  const usableH = canvas.clientHeight - verticalPadding(padding)
  if (usableW < 80 || usableH < 80) return

  const start = map.project([route.fromLon, route.fromLat])
  const end = map.project([route.toLon, route.toLat])
  const spanW = Math.abs(end.x - start.x)
  const spanH = Math.abs(end.y - start.y)
  const bump = zoomBumpForPlaceSpan(spanW, spanH, usableW, usableH)
  const before = map.getZoom()
  if (bump > 0.05) {
    map.setZoom(Math.min(before + bump, ROUTE_FIT_MAX_ZOOM))
    if (!routeEndpointsInPadding(map, route, padding)) map.setZoom(before)
  }

  const floor = minZoomForShortRoute(route.distanceM)
  if (floor !== null && map.getZoom() + 0.05 < floor) {
    const zoomed = map.getZoom()
    map.setZoom(Math.min(floor, ROUTE_FIT_MAX_ZOOM))
    if (!routeEndpointsInPadding(map, route, padding)) map.setZoom(zoomed)
  }
}

function routeEndpointsInPadding(map: Map, route: MapRouteDisplay, padding: PaddingOptions): boolean {
  const canvas = map.getCanvas()
  const left = typeof padding === 'number' ? padding : (padding.left ?? 0)
  const right =
    canvas.clientWidth - (typeof padding === 'number' ? padding : (padding.right ?? 0))
  const top = typeof padding === 'number' ? padding : (padding.top ?? 0)
  const bottom =
    canvas.clientHeight - (typeof padding === 'number' ? padding : (padding.bottom ?? 0))
  const points: [number, number][] = [
    [route.fromLon, route.fromLat],
    [route.toLon, route.toLat],
    ...(route.geometry.coordinates as [number, number][]),
  ]
  return points.every((coord) => {
    const p = map.project(coord)
    return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom
  })
}
