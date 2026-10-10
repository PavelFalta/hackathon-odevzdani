import type { GeoJSONSource, Map } from 'mapbox-gl'
import type { LightPreset } from './basemapStyle'
import { ensureOutsideShadedBasemapClip, KVK_REGION_MASK_SOURCE } from './regionMaskBasemapClip'
import { applyRegionMaskProjection } from './regionMaskProjection'
import { KVK_BOUNDARY_LINE_LAYER, KVK_MASK_FILL_LAYER } from './regionMaskIds'

export const KVK_BOUNDARY_URL = '/data/kvk-boundary.geojson'

const MASK_SOURCE = KVK_REGION_MASK_SOURCE
const BOUNDARY_SOURCE = 'kvk-boundary'
const MASK_LAYER = KVK_MASK_FILL_LAYER
const BORDER_LAYER = KVK_BOUNDARY_LINE_LAYER

type Position = [number, number]
type Ring = Position[]
export type KvkPolygonFeature = {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: { type: 'Polygon'; coordinates: Ring[] }
}

const MASK_PAINT: Record<LightPreset, { fill: string; opacity: number; line: string }> = {
  day: { fill: 'rgb(10, 16, 26)', opacity: 0.44, line: 'rgb(72, 132, 188)' },
  dawn: { fill: 'rgb(28, 18, 22)', opacity: 0.4, line: 'rgb(200, 120, 90)' },
  dusk: { fill: 'rgb(8, 6, 18)', opacity: 0.48, line: 'rgb(140, 100, 140)' },
  night: { fill: 'rgb(2, 6, 14)', opacity: 0.52, line: 'rgb(48, 88, 128)' },
}

export async function loadKvkBoundary(): Promise<KvkPolygonFeature> {
  const res = await fetch(KVK_BOUNDARY_URL)
  if (!res.ok) throw new Error(`KVK boundary fetch failed: ${res.status}`)
  const collection = (await res.json()) as { features: KvkPolygonFeature[] }
  const feature = collection.features[0]
  if (!feature || feature.geometry.type !== 'Polygon') {
    throw new Error('KVK boundary GeoJSON must contain one Polygon feature')
  }
  return feature
}

export function reverseRing(ring: Ring): Ring {
  return ring.slice().reverse() as Ring
}

/** World-spanning ring with the kraj polygon cut out (dims everything outside at any zoom/pitch). */
const WORLD_MASK_OUTER: Ring = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
]

export function buildOutsideMaskFeature(boundary: KvkPolygonFeature): KvkPolygonFeature {
  const outer = WORLD_MASK_OUTER
  const hole = reverseRing(boundary.geometry.coordinates[0] as Ring)
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [outer, hole] },
  }
}

export function ensureRegionMaskLayers(
  map: Map,
  boundary: KvkPolygonFeature,
  mask: KvkPolygonFeature,
) {
  if (!map.getSource(BOUNDARY_SOURCE)) {
    map.addSource(BOUNDARY_SOURCE, { type: 'geojson', data: boundary })
  } else {
    ;(map.getSource(BOUNDARY_SOURCE) as GeoJSONSource).setData(boundary)
  }
  if (!map.getSource(MASK_SOURCE)) {
    map.addSource(MASK_SOURCE, { type: 'geojson', data: mask })
  } else {
    ;(map.getSource(MASK_SOURCE) as GeoJSONSource).setData(mask)
  }
  if (!map.getLayer(MASK_LAYER)) {
    map.addLayer({
      id: MASK_LAYER,
      type: 'fill',
      source: MASK_SOURCE,
      paint: { 'fill-color': MASK_PAINT.day.fill, 'fill-opacity': MASK_PAINT.day.opacity },
    })
  }
  if (!map.getLayer(BORDER_LAYER)) {
    map.addLayer({
      id: BORDER_LAYER,
      type: 'line',
      source: BOUNDARY_SOURCE,
      paint: {
        'line-color': MASK_PAINT.day.line,
        'line-width': 2,
        'line-opacity': 0.9,
      },
    })
  }
  ensureOutsideShadedBasemapClip(map)
}

export function applyRegionMaskStyle(map: Map, preset: LightPreset) {
  const paint = MASK_PAINT[preset]
  if (map.getLayer(MASK_LAYER)) {
    map.setPaintProperty(MASK_LAYER, 'fill-color', paint.fill)
    map.setPaintProperty(MASK_LAYER, 'fill-opacity', paint.opacity)
  }
  if (map.getLayer(BORDER_LAYER)) {
    map.setPaintProperty(BORDER_LAYER, 'line-color', paint.line)
  }
}

export async function installRegionMask(map: Map, preset: LightPreset) {
  applyRegionMaskProjection(map)
  const boundary = await loadKvkBoundary()
  const mask = buildOutsideMaskFeature(boundary)
  ensureRegionMaskLayers(map, boundary, mask)
  applyRegionMaskStyle(map, preset)
}
