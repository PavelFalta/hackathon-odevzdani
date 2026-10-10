import type { Map } from 'mapbox-gl'
import { applyBasemapStyle, type BasemapStyleState } from './basemapStyle'

/** After the canvas stops being `visibility:hidden`, WebGL + Standard 3D need a resize + config refresh. */
export function refreshMapGlAfterShow(map: Map, style: BasemapStyleState) {
  map.resize()
  applyBasemapStyle(map, style)
}
