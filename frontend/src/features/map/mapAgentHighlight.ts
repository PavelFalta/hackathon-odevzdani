import type { GeoJSONSource, Map } from 'mapbox-gl'
import { isMapStyleReady, mapHasLayer } from './mapStyleGuards'
import { raiseUserLocationMapLayers } from './userLocation/userLocationMapMarker'
import { clearAgentHighlightLabels, syncAgentHighlightLabels } from './mapAgentHighlightLayers'

const SOURCE_ID = 'agent-highlight'
const GLOW_LAYER_ID = 'agent-highlight-glow'
const CORE_LAYER_ID = 'agent-highlight-core'
const RING_LAYER_ID = 'agent-highlight-ring'

export type MapHighlightPlace = { lon: number; lat: number; label?: string }

function ensureHighlightLayers(map: Map) {
  if (!isMapStyleReady(map)) return
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
  }
  if (!mapHasLayer(map, GLOW_LAYER_ID)) {
    map.addLayer({
      id: GLOW_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['case', ['boolean', ['get', 'primary'], false], 42, 28],
        'circle-color': '#f38518',
        'circle-opacity': ['case', ['boolean', ['get', 'primary'], false], 0.34, 0.2],
        'circle-blur': 0.75,
      },
    })
  }
  if (!mapHasLayer(map, RING_LAYER_ID)) {
    map.addLayer({
      id: RING_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['case', ['boolean', ['get', 'primary'], false], 22, 16],
        'circle-color': 'transparent',
        'circle-stroke-width': ['case', ['boolean', ['get', 'primary'], false], 4, 3],
        'circle-stroke-color': '#f38518',
        'circle-stroke-opacity': 0.95,
      },
    })
  }
  if (!mapHasLayer(map, CORE_LAYER_ID)) {
    map.addLayer({
      id: CORE_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['case', ['boolean', ['get', 'primary'], false], 13, 9],
        'circle-color': '#6fc3df',
        'circle-opacity': 1,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.95,
      },
    })
  }
}

export function setAgentMapHighlights(map: Map, places: MapHighlightPlace[], primaryIndex = 0) {
  if (!isMapStyleReady(map)) return
  ensureHighlightLayers(map)
  const data = {
    type: 'FeatureCollection' as const,
    features: places.map((place, index) => ({
      type: 'Feature' as const,
      properties: { primary: index === primaryIndex, label: place.label ?? '' },
      geometry: { type: 'Point' as const, coordinates: [place.lon, place.lat] },
    })),
  }
  ;(map.getSource(SOURCE_ID) as GeoJSONSource).setData(data)
  if (places.length > 0) syncAgentHighlightLabels(map, places, primaryIndex)
  else clearAgentHighlightLabels(map)
  raiseUserLocationMapLayers(map)
}

export function setAgentMapHighlight(map: Map, lon: number, lat: number) {
  setAgentMapHighlights(map, [{ lon, lat }], 0)
}

export function clearAgentMapHighlight(map: Map) {
  if (!map.getSource(SOURCE_ID)) return
  ;(map.getSource(SOURCE_ID) as GeoJSONSource).setData({
    type: 'FeatureCollection',
    features: [],
  })
  clearAgentHighlightLabels(map)
  raiseUserLocationMapLayers(map)
}
