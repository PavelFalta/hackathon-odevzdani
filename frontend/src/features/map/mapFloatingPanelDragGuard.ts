import type { Map } from 'mapbox-gl'

let mapRef: Map | null = null
let lockDepth = 0

const HANDLERS = [
  'dragPan',
  'dragRotate',
  'scrollZoom',
  'touchZoomRotate',
  'doubleClickZoom',
] as const

export function registerMapForFloatingPanelDrag(map: Map | null): void {
  mapRef = map
}

function setMapHandlersEnabled(enabled: boolean): void {
  if (!mapRef) return
  for (const name of HANDLERS) {
    const handler = mapRef[name]
    if (enabled) handler.enable()
    else handler.disable()
  }
}

export function suspendMapForFloatingPanelDrag(): void {
  lockDepth += 1
  if (lockDepth !== 1) return
  mapRef?.stop()
  setMapHandlersEnabled(false)
}

export function resumeMapForFloatingPanelDrag(): void {
  if (lockDepth === 0) return
  lockDepth -= 1
  if (lockDepth !== 0) return
  setMapHandlersEnabled(true)
}

/** @internal Vitest only */
export function resetMapFloatingPanelDragGuardForTests(): void {
  lockDepth = 0
  mapRef = null
}
