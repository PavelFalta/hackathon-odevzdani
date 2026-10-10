import type { Map } from 'mapbox-gl'
import { applyBasemapStyle, basemapStyleUrl, type BasemapStyleState } from './basemapStyle'
import { applyFogForPreset, ensureTerrainSource } from './mapTerrain'
import { applyKrajViewportLimits } from './mapViewportLimits'
import { applyRegionMaskStyle, installRegionMask } from './regionMask'

export function switchBasemapAppearance(map: Map, state: BasemapStyleState) {
  map.setStyle(basemapStyleUrl(state.basemapAppearance))
  map.once('style.load', () => {
    void reconcileMapAfterStyleChange(map, state)
  })
}

export async function reconcileMapAfterStyleChange(map: Map, state: BasemapStyleState) {
  ensureTerrainSource(map)
  applyBasemapStyle(map, state)
  applyFogForPreset(map, state.lightPreset)
  await installRegionMask(map, state.lightPreset)
  applyKrajViewportLimits(map)
  applyRegionMaskStyle(map, state.lightPreset)
}
