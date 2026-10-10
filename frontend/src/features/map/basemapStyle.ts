import type { Map } from 'mapbox-gl'

export type LightPreset = 'day' | 'dawn' | 'dusk' | 'night'
export type BasemapAppearance = 'standard' | 'satellite'

export const BASEMAP_STYLE_URLS: Record<BasemapAppearance, string> = {
  standard: 'mapbox://styles/mapbox/standard',
  satellite: 'mapbox://styles/mapbox/standard-satellite',
}

export function basemapStyleUrl(appearance: BasemapAppearance): string {
  return BASEMAP_STYLE_URLS[appearance]
}

export type BasemapStyleState = {
  basemapAppearance: BasemapAppearance
  lightPreset: LightPreset
  show3dObjects: boolean
  /** Standard Satellite only — roads and transit vector overlay on imagery. */
  showRoadsAndTransit: boolean
  showPlaceLabels: boolean
  showPointOfInterestLabels: boolean
  showRoadLabels: boolean
  showTransitLabels: boolean
  terrainExaggeration: number
}

export const DEFAULT_BASEMAP_STYLE: BasemapStyleState = {
  basemapAppearance: 'standard',
  lightPreset: 'day',
  show3dObjects: true,
  showRoadsAndTransit: true,
  showPlaceLabels: true,
  showPointOfInterestLabels: true,
  showRoadLabels: true,
  showTransitLabels: true,
  terrainExaggeration: 1.45,
}

function applyBasemap3dLayers(map: Map, enabled: boolean) {
  map.setConfigProperty('basemap', 'show3dObjects', enabled)
  map.setConfigProperty('basemap', 'show3dTrees', enabled)
  map.setConfigProperty('basemap', 'show3dBuildings', enabled)
  map.setConfigProperty('basemap', 'show3dLandmarks', enabled)
  map.setConfigProperty('basemap', 'show3dFacades', enabled)
}

function sharedLabelConfig(state: BasemapStyleState) {
  return {
    lightPreset: state.lightPreset,
    showPlaceLabels: state.showPlaceLabels,
    showPointOfInterestLabels: state.showPointOfInterestLabels,
    showRoadLabels: state.showRoadLabels,
    showTransitLabels: state.showTransitLabels,
  }
}

/** Initial `config` for `new mapboxgl.Map({ config })` — same flags as runtime `applyBasemapStyle`. */
export function basemapImportConfig(state: BasemapStyleState) {
  if (state.basemapAppearance === 'satellite') {
    return {
      basemap: {
        ...sharedLabelConfig(state),
        showRoadsAndTransit: state.showRoadsAndTransit,
      },
    }
  }
  const on = state.show3dObjects
  return {
    basemap: {
      ...sharedLabelConfig(state),
      show3dObjects: on,
      show3dTrees: on,
      show3dBuildings: on,
      show3dLandmarks: on,
      show3dFacades: on,
      colorBuildingSelect: '#f38518',
      colorBuildingHighlight: '#6fc3df',
    },
  }
}

export function applyBasemapStyle(map: Map, state: BasemapStyleState) {
  map.setConfigProperty('basemap', 'lightPreset', state.lightPreset)
  if (state.basemapAppearance === 'standard') {
    applyBasemap3dLayers(map, state.show3dObjects)
    map.setConfigProperty('basemap', 'colorBuildingSelect', '#f38518')
    map.setConfigProperty('basemap', 'colorBuildingHighlight', '#6fc3df')
  } else {
    map.setConfigProperty('basemap', 'showRoadsAndTransit', state.showRoadsAndTransit)
  }
  map.setConfigProperty('basemap', 'showPlaceLabels', state.showPlaceLabels)
  map.setConfigProperty('basemap', 'showPointOfInterestLabels', state.showPointOfInterestLabels)
  map.setConfigProperty('basemap', 'showRoadLabels', state.showRoadLabels)
  map.setConfigProperty('basemap', 'showTransitLabels', state.showTransitLabels)
  if (map.getSource('mapbox-dem')) {
    if (state.terrainExaggeration <= 0) map.setTerrain(null)
    else map.setTerrain({ source: 'mapbox-dem', exaggeration: state.terrainExaggeration })
  }
}
