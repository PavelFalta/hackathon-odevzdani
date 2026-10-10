import mapboxgl, { type Map, type PaddingOptions } from 'mapbox-gl'
import type { MapHighlightPlace } from './mapAgentHighlight'
import { computeRouteFitPadding } from './routeFitPadding'

const FIT_DURATION_MS = 1400
const COMPARE_MAX_ZOOM = 16.2
const FILL_FRACTION = 0.94

function horizontalPadding(padding: PaddingOptions): number {
  if (typeof padding === 'number') return padding * 2
  return (padding.left ?? 0) + (padding.right ?? 0)
}

function verticalPadding(padding: PaddingOptions): number {
  if (typeof padding === 'number') return padding * 2
  return (padding.top ?? 0) + (padding.bottom ?? 0)
}

export function zoomBumpForPlaceSpan(
  spanW: number,
  spanH: number,
  usableW: number,
  usableH: number,
  fill = FILL_FRACTION,
): number {
  const targetW = usableW * fill
  const targetH = usableH * fill
  const bumpW = spanW > 0 && spanW < targetW ? Math.log2(targetW / spanW) : 0
  const bumpH = spanH > 0 && spanH < targetH ? Math.log2(targetH / spanH) : 0
  return Math.min(bumpW, bumpH)
}

function placesBounds(places: MapHighlightPlace[]): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds()
  for (const place of places) {
    bounds.extend([place.lon, place.lat])
  }
  return bounds
}

function resolvePadding(map: Map, padding?: PaddingOptions): PaddingOptions {
  if (padding) return padding
  const canvas = map.getCanvas()
  return computeRouteFitPadding(canvas.clientWidth, canvas.clientHeight, [])
}

function tightenZoomToPlaces(map: Map, places: MapHighlightPlace[], padding: PaddingOptions): void {
  const canvas = map.getCanvas()
  const usableW = canvas.clientWidth - horizontalPadding(padding)
  const usableH = canvas.clientHeight - verticalPadding(padding)
  if (usableW < 80 || usableH < 80) return

  const projected = places.map((p) => map.project([p.lon, p.lat]))
  const xs = projected.map((p) => p.x)
  const ys = projected.map((p) => p.y)
  const spanW = Math.max(...xs) - Math.min(...xs)
  const spanH = Math.max(...ys) - Math.min(...ys)
  const bump = zoomBumpForPlaceSpan(spanW, spanH, usableW, usableH)
  if (bump > 0.05) {
    const before = map.getZoom()
    map.setZoom(Math.min(before + bump, COMPARE_MAX_ZOOM))
    if (!placesInsidePadding(map, places, padding)) map.setZoom(before)
  }
}

function placesInsidePadding(
  map: Map,
  places: MapHighlightPlace[],
  padding: PaddingOptions,
): boolean {
  const canvas = map.getCanvas()
  const left = typeof padding === 'number' ? padding : (padding.left ?? 0)
  const right = canvas.clientWidth - (typeof padding === 'number' ? padding : (padding.right ?? 0))
  const top = typeof padding === 'number' ? padding : (padding.top ?? 0)
  const bottom =
    canvas.clientHeight - (typeof padding === 'number' ? padding : (padding.bottom ?? 0))
  return places.every((place) => {
    const p = map.project([place.lon, place.lat])
    return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom
  })
}

export function fitMapToAgentPlaces(
  map: Map,
  places: MapHighlightPlace[],
  padding?: PaddingOptions,
): Promise<void> {
  if (places.length === 0) return Promise.resolve()
  const fitPadding = resolvePadding(map, padding)

  if (places.length === 1) {
    const only = places[0]
    return new Promise((resolve) => {
      map.once('moveend', () => resolve())
      map.easeTo({
        center: [only.lon, only.lat],
        zoom: Math.min(Math.max(map.getZoom(), 14), COMPARE_MAX_ZOOM),
        pitch: 0,
        duration: FIT_DURATION_MS,
        essential: true,
      })
    })
  }

  const bounds = placesBounds(places)
  if (bounds.isEmpty()) return Promise.resolve()

  return new Promise((resolve) => {
    map.once('moveend', () => {
      tightenZoomToPlaces(map, places, fitPadding)
      resolve()
    })
    map.fitBounds(bounds, {
      padding: fitPadding,
      maxZoom: COMPARE_MAX_ZOOM,
      duration: FIT_DURATION_MS,
      pitch: 0,
      essential: true,
    })
  })
}
