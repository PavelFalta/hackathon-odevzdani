import type { GeoJSONSource, Map } from 'mapbox-gl'
import type { MapHighlightPlace } from './mapAgentHighlight'
import { isMapStyleReady, mapHasLayer } from './mapStyleGuards'

const LABEL_SOURCE_ID = 'agent-highlight-columns-labels'
const LABEL_LAYER_ID = 'agent-highlight-labels'

const LEGACY_COLUMN_SOURCE_ID = 'agent-highlight-columns'
const LEGACY_COLUMN_LAYER_IDS = [
  'agent-highlight-columns-extrusion',
  'agent-highlight-column-glow',
  'agent-highlight-column-core',
]

function removeLegacyColumnLayers(map: Map) {
  if (!isMapStyleReady(map)) return
  for (const id of LEGACY_COLUMN_LAYER_IDS) {
    if (mapHasLayer(map, id)) map.removeLayer(id)
  }
  if (map.getSource(LEGACY_COLUMN_SOURCE_ID)) map.removeSource(LEGACY_COLUMN_SOURCE_ID)
  if (map.getSource(`${LEGACY_COLUMN_SOURCE_ID}-core`)) {
    map.removeSource(`${LEGACY_COLUMN_SOURCE_ID}-core`)
  }
}

function labelData(places: MapHighlightPlace[], primaryIndex: number) {
  return {
    type: 'FeatureCollection' as const,
    features: places.map((place, index) => ({
      type: 'Feature' as const,
      properties: {
        primary: index === primaryIndex,
        label: place.label ?? '',
      },
      geometry: { type: 'Point' as const, coordinates: [place.lon, place.lat] },
    })),
  }
}

export function syncAgentHighlightLabels(
  map: Map,
  places: MapHighlightPlace[],
  primaryIndex: number,
) {
  if (!isMapStyleReady(map)) return
  removeLegacyColumnLayers(map)
  const data = labelData(places, primaryIndex)

  if (!map.getSource(LABEL_SOURCE_ID)) {
    map.addSource(LABEL_SOURCE_ID, { type: 'geojson', data })
    map.addLayer({
      id: LABEL_LAYER_ID,
      type: 'symbol',
      source: LABEL_SOURCE_ID,
      layout: {
        'text-field': ['get', 'label'],
        'text-size': 13,
        'text-offset': [0, -2.2],
        'text-anchor': 'bottom',
        'text-max-width': 12,
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      },
      paint: {
        'text-color': '#f8fafc',
        'text-halo-color': '#020617',
        'text-halo-width': 1.4,
      },
    })
  } else {
    ;(map.getSource(LABEL_SOURCE_ID) as GeoJSONSource).setData(data)
  }
}

export function clearAgentHighlightLabels(map: Map) {
  if (!isMapStyleReady(map)) return
  removeLegacyColumnLayers(map)
  const empty = { type: 'FeatureCollection' as const, features: [] }
  const labelSource = map.getSource(LABEL_SOURCE_ID)
  if (labelSource) (labelSource as GeoJSONSource).setData(empty)
}
