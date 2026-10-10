import type { RouteLineGeometry } from '../../api/mapDirections'
import type { GeoJSONSource, Map } from 'mapbox-gl'

const ROUTE_SOURCE_ID = 'agent-route-line'
const ROUTE_LAYER_ID = 'agent-route-line-layer'
const ROUTE_GLOW_LAYER_ID = 'agent-route-line-glow'
const ORIGIN_LAYER_ID = 'agent-route-origin'
const DEST_LAYER_ID = 'agent-route-destination'
const ENDPOINTS_SOURCE_ID = 'agent-route-endpoints'

export type MapRouteDisplay = {
  geometry: RouteLineGeometry
  fromLon: number
  fromLat: number
  toLon: number
  toLat: number
  distanceM?: number
}

function ensureRouteLayers(map: Map) {
  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
  }
  if (!map.getLayer(ROUTE_GLOW_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_GLOW_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#22d3ee',
        'line-width': 10,
        'line-opacity': 0.25,
        'line-blur': 2,
      },
    })
  }
  if (!map.getLayer(ROUTE_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: 'line',
      source: ROUTE_SOURCE_ID,
      paint: {
        'line-color': '#38bdf8',
        'line-width': 4,
        'line-opacity': 0.92,
      },
    })
  }
  if (!map.getSource(ENDPOINTS_SOURCE_ID)) {
    map.addSource(ENDPOINTS_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
  }
  if (!map.getLayer(ORIGIN_LAYER_ID)) {
    map.addLayer({
      id: ORIGIN_LAYER_ID,
      type: 'circle',
      source: ENDPOINTS_SOURCE_ID,
      filter: ['==', ['get', 'role'], 'origin'],
      paint: {
        'circle-radius': 7,
        'circle-color': '#4ade80',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#020617',
      },
    })
  }
  if (!map.getLayer(DEST_LAYER_ID)) {
    map.addLayer({
      id: DEST_LAYER_ID,
      type: 'circle',
      source: ENDPOINTS_SOURCE_ID,
      filter: ['==', ['get', 'role'], 'destination'],
      paint: {
        'circle-radius': 7,
        'circle-color': '#fb923c',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#020617',
      },
    })
  }
}

export function syncAgentRouteLayer(map: Map, route: MapRouteDisplay | null): void {
  ensureRouteLayers(map)
  const lineSource = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource
  const pointSource = map.getSource(ENDPOINTS_SOURCE_ID) as GeoJSONSource
  if (!route) {
    lineSource.setData({ type: 'FeatureCollection', features: [] })
    pointSource.setData({ type: 'FeatureCollection', features: [] })
    return
  }
  lineSource.setData({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: route.geometry }],
  })
  pointSource.setData({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { role: 'origin' },
        geometry: { type: 'Point', coordinates: [route.fromLon, route.fromLat] },
      },
      {
        type: 'Feature',
        properties: { role: 'destination' },
        geometry: { type: 'Point', coordinates: [route.toLon, route.toLat] },
      },
    ],
  })
}
