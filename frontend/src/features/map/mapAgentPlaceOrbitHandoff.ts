import type { Map, MapEventType } from 'mapbox-gl'
import { releaseAgentPlaceOrbit } from './mapPlaceOrbit'

type GestureEvent = { originalEvent?: Event }

/** Pan/zoom/rotate starts — avoid `mousedown`/`touchstart` (they fire before drag and used to `map.stop()` every click). */
const USER_GESTURE_EVENTS: MapEventType[] = [
  'dragstart',
  'zoomstart',
  'rotatestart',
  'pitchstart',
  'wheel',
  'dblclick',
]

function isUserGesture(event: GestureEvent): boolean {
  return Boolean(event.originalEvent)
}

function onUserGesture() {
  releaseAgentPlaceOrbit()
}

export function bindAgentPlaceOrbitHandoff(map: Map): () => void {
  const handler = (...args: unknown[]) => {
    const event = args[0]
    if (event && typeof event === 'object' && isUserGesture(event as GestureEvent)) {
      onUserGesture()
    }
  }
  for (const type of USER_GESTURE_EVENTS) {
    map.on(type, handler as never)
  }
  return () => {
    for (const type of USER_GESTURE_EVENTS) {
      map.off(type, handler as never)
    }
  }
}
