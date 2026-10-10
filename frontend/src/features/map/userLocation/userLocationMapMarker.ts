import type { GeoJSONSource, Map } from 'mapbox-gl'
import { isMapStyleReady, mapHasLayer } from '../mapStyleGuards'
import { USER_LOCATION_LAYER_IDS, USER_LOCATION_MAP_RADII } from './userLocationMapMarkerConfig'
import {
  USER_LOCATION_GREEN,
  USER_LOCATION_GREEN_BRIGHT,
  USER_LOCATION_GREEN_SOFT,
} from './userLocationMarkerStyle'
import type { UserLocationFix } from './userLocationTypes'

const {
  source: SOURCE_ID,
  halo: HALO_LAYER_ID,
  pulse: PULSE_LAYER_ID,
  ring: RING_LAYER_ID,
  core: CORE_LAYER_ID,
} = USER_LOCATION_LAYER_IDS

const LEGACY_BEAM_LAYERS = ['user-location-beam-glow', 'user-location-beam-core']
const LEGACY_BEAM_SOURCES = ['user-location-beam', 'user-location-beam-core']

const VIEWPORT_CIRCLE = { 'circle-pitch-alignment': 'viewport' as const }

function clearLegacyUserLocationBeam(map: Map) {
  for (const id of LEGACY_BEAM_LAYERS) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
  for (const id of LEGACY_BEAM_SOURCES) {
    if (map.getSource(id)) map.removeSource(id)
  }
}

export function raiseUserLocationMapLayers(map: Map) {
  if (!isMapStyleReady(map)) return
  for (const id of [HALO_LAYER_ID, PULSE_LAYER_ID, RING_LAYER_ID, CORE_LAYER_ID]) {
    if (mapHasLayer(map, id)) map.moveLayer(id)
  }
}

function ensureLayers(map: Map) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
  }
  if (!map.getLayer(HALO_LAYER_ID)) {
    map.addLayer({
      id: HALO_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        ...VIEWPORT_CIRCLE,
        'circle-radius': USER_LOCATION_MAP_RADII.halo,
        'circle-color': USER_LOCATION_GREEN_BRIGHT,
        'circle-opacity': 0.48,
        'circle-blur': 0.35,
      },
    })
  }
  if (!map.getLayer(PULSE_LAYER_ID)) {
    map.addLayer({
      id: PULSE_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        ...VIEWPORT_CIRCLE,
        'circle-radius': USER_LOCATION_MAP_RADII.pulse,
        'circle-color': USER_LOCATION_GREEN_SOFT,
        'circle-opacity': 0.62,
        'circle-blur': 0.15,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 0.55,
      },
    })
  }
  if (!map.getLayer(RING_LAYER_ID)) {
    map.addLayer({
      id: RING_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        ...VIEWPORT_CIRCLE,
        'circle-radius': USER_LOCATION_MAP_RADII.ring,
        'circle-color': 'transparent',
        'circle-stroke-width': 4,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 1,
      },
    })
  }
  if (!map.getLayer(CORE_LAYER_ID)) {
    map.addLayer({
      id: CORE_LAYER_ID,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        ...VIEWPORT_CIRCLE,
        'circle-radius': USER_LOCATION_MAP_RADII.core,
        'circle-color': USER_LOCATION_GREEN,
        'circle-opacity': 1,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': 1,
      },
    })
  }
  raiseUserLocationMapLayers(map)
}

export function syncUserLocationMapMarker(map: Map, fix: UserLocationFix | null) {
  clearLegacyUserLocationBeam(map)
  ensureLayers(map)
  const data = fix
    ? {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            properties: { source: fix.source },
            geometry: { type: 'Point' as const, coordinates: [fix.lon, fix.lat] },
          },
        ],
      }
    : { type: 'FeatureCollection' as const, features: [] }
  ;(map.getSource(SOURCE_ID) as GeoJSONSource).setData(data)
  if (fix) raiseUserLocationMapLayers(map)
}

export function clearUserLocationMapMarker(map: Map) {
  syncUserLocationMapMarker(map, null)
}
