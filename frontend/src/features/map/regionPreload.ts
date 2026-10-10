import type { Map } from 'mapbox-gl'
import { waitForMapIdleOrTimeout } from './mapIdle'

/** Soft cap — we stop adding viewpoints after this. */
export const PRELOAD_BUDGET_MS = 10_000
/** Per stop, do not wait forever for tiles. */
const PER_STOP_MS = 2_200

type Viewpoint = { center: [number, number]; zoom: number }

/** Cheb-first + a few kraj anchors (low count, low bandwidth). */
export const PRELOAD_VIEWPOINTS: Viewpoint[] = [
  { center: [12.3736, 50.0736], zoom: 11 },
  { center: [12.3736, 50.0736], zoom: 14.5 },
  { center: [12.3736, 50.0736], zoom: 16 },
  { center: [12.871, 50.231], zoom: 13.5 },
  { center: [12.639, 50.207], zoom: 13.5 },
  { center: [13.012, 50.36], zoom: 12.5 },
]

export function countPreloadViewpoints(): number {
  return PRELOAD_VIEWPOINTS.length
}

export async function preloadKvkRegion(
  map: Map,
  isCancelled: () => boolean,
  onStop?: (finished: number) => void,
): Promise<void> {
  const deadline = performance.now() + PRELOAD_BUDGET_MS
  let finished = 0

  for (const view of PRELOAD_VIEWPOINTS) {
    if (isCancelled() || performance.now() >= deadline) break
    map.jumpTo({
      center: view.center,
      zoom: view.zoom,
      pitch: 0,
      bearing: 0,
    })
    await waitForMapIdleOrTimeout(map, PER_STOP_MS)
    if (isCancelled()) return
    finished += 1
    onStop?.(finished)
  }
}
