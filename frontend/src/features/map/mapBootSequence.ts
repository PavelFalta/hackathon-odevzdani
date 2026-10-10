import type { Map } from 'mapbox-gl'
import { applyBasemapStyle, type BasemapStyleState } from './basemapStyle'
import { refreshMapGlAfterShow } from './mapReveal'
import { applyFogForPreset, ensureTerrainSource } from './mapTerrain'
import { installRegionMask } from './regionMask'
import { waitForMapIdle } from './mapIdle'
import { mapBootLoadFraction } from './mapBootProgress'
import { countPreloadViewpoints, preloadKvkRegion } from './regionPreload'
import { CHEB_VIEW, PANORAMA_DURATION_MS, PANORAMA_START } from './region'

export type BootPhase = 'loading' | 'panorama' | 'ready'

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function waitUntil(ready: () => boolean, isCancelled: () => boolean) {
  while (!ready()) {
    if (isCancelled()) return false
    await delay(40)
  }
  return !isCancelled()
}

export async function runMapBootSequence(
  map: Map,
  onPhase: (phase: BootPhase) => void,
  isCancelled: () => boolean,
  onProgress: (fraction: number) => void = () => {},
  canPresent: () => boolean = () => true,
  style: BasemapStyleState,
) {
  ensureTerrainSource(map)
  applyBasemapStyle(map, style)
  applyFogForPreset(map, style.lightPreset)
  await installRegionMask(map, style.lightPreset)
  if (isCancelled()) return

  const stops = countPreloadViewpoints()
  onPhase('loading')
  onProgress(mapBootLoadFraction(0, stops))
  await preloadKvkRegion(map, isCancelled, (done) => onProgress(mapBootLoadFraction(done, stops)))
  if (isCancelled()) return
  if (!(await waitUntil(canPresent, isCancelled))) return

  onProgress(1)
  onPhase('panorama')
  refreshMapGlAfterShow(map, style)
  map.jumpTo(PANORAMA_START)
  map.flyTo({ ...CHEB_VIEW, duration: PANORAMA_DURATION_MS, essential: true, curve: 1.35 })
  await waitForMapIdle(map)
  if (isCancelled()) return

  applyBasemapStyle(map, style)
  applyFogForPreset(map, style.lightPreset)
}
