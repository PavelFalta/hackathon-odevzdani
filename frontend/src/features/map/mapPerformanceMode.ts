import type { Map } from 'mapbox-gl'
import { DEFAULT_BASEMAP_STYLE, type BasemapStyleState } from './basemapStyle'
import { ensureTerrainSource } from './mapTerrain'
import { syncMapPerformance2dPitchControls } from './mapNavigationView'
import { CHEB_VIEW } from './region'

export type MapPerformanceMode = '3d' | '2d'

const STORAGE_KEY = 'kairos.mapPerformanceMode'

export type SavedBasemap3dStyle = Pick<BasemapStyleState, 'show3dObjects' | 'terrainExaggeration'>

export function readStoredMapPerformanceMode(): MapPerformanceMode {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '2d') return '2d'
  } catch {
    /* private mode */
  }
  return '3d'
}

export function storeMapPerformanceMode(mode: MapPerformanceMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* quota / private mode */
  }
}

export function basemapStyleForPerformanceMode(
  style: BasemapStyleState,
  mode: MapPerformanceMode,
): BasemapStyleState {
  if (mode === '3d') return style
  return { ...style, show3dObjects: false, terrainExaggeration: 0 }
}

export function patchBasemapForPerformanceToggle(
  prev: BasemapStyleState,
  mode: MapPerformanceMode,
  saved3d: SavedBasemap3dStyle | null,
): { next: BasemapStyleState; saved3d: SavedBasemap3dStyle | null } {
  if (mode === '2d') {
    const snapshot: SavedBasemap3dStyle = saved3d ?? {
      show3dObjects: prev.show3dObjects,
      terrainExaggeration: prev.terrainExaggeration,
    }
    return {
      saved3d: snapshot,
      next: { ...prev, show3dObjects: false, terrainExaggeration: 0 },
    }
  }
  const restore = saved3d ?? {
    show3dObjects: DEFAULT_BASEMAP_STYLE.show3dObjects,
    terrainExaggeration: DEFAULT_BASEMAP_STYLE.terrainExaggeration,
  }
  return {
    saved3d: null,
    next: { ...prev, ...restore },
  }
}

const FLAT_EASE_MS = 520
const MIN_RESTORED_PITCH = 1

let savedPitchBefore2d: number | null = null

/** @internal Vitest only */
export function resetMapPerformanceModeViewForTests(): void {
  savedPitchBefore2d = null
}

export function syncMapPerformanceModeView(map: Map, mode: MapPerformanceMode): void {
  const flat = mode === '2d'
  syncMapPerformance2dPitchControls(map, flat)
  if (flat) {
    savedPitchBefore2d = map.getPitch()
    map.easeTo({ pitch: 0, duration: FLAT_EASE_MS, essential: true })
    map.setTerrain(null)
    return
  }
  ensureTerrainSource(map)
  const pitch =
    savedPitchBefore2d != null && savedPitchBefore2d > MIN_RESTORED_PITCH
      ? savedPitchBefore2d
      : CHEB_VIEW.pitch
  savedPitchBefore2d = null
  map.easeTo({ pitch, duration: FLAT_EASE_MS, essential: true })
}
