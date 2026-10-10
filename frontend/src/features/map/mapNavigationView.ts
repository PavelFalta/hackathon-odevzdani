import type { Map } from 'mapbox-gl'

const FLAT_PITCH = 0
const EASE_MS = 720

let flatDepth = 0
let savedPitch: number | null = null
let performance2dLock = false

export function setMapPerformance2dLock(locked: boolean): void {
  performance2dLock = locked
}

export function syncMapPerformance2dPitchControls(map: Map | null, locked: boolean): void {
  setMapPerformance2dLock(locked)
  if (!map) return
  if (locked) {
    map.touchPitch.disable()
    map.dragRotate.disablePitch()
    return
  }
  if (flatDepth === 0) {
    map.touchPitch.enable()
    map.dragRotate.enablePitch()
  }
}

export function setMapNavigationFlatView(map: Map, flat: boolean): void {
  if (flat) {
    if (flatDepth === 0) {
      savedPitch = map.getPitch()
      map.touchPitch.disable()
      map.dragRotate.disablePitch()
      map.jumpTo({ pitch: FLAT_PITCH })
    }
    flatDepth += 1
    return
  }
  if (flatDepth === 0) return
  flatDepth -= 1
  if (flatDepth > 0) return
  if (performance2dLock) {
    savedPitch = null
    return
  }
  map.touchPitch.enable()
  map.dragRotate.enablePitch()
  const pitch = savedPitch ?? FLAT_PITCH
  savedPitch = null
  map.easeTo({ pitch, duration: EASE_MS, essential: true })
}

/** @internal Vitest only */
export function resetMapNavigationViewForTests(): void {
  flatDepth = 0
  savedPitch = null
  performance2dLock = false
}
