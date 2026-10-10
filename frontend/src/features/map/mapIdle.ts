import type { Map } from 'mapbox-gl'

export function waitForMapIdle(map: Map): Promise<void> {
  return new Promise((resolve) => {
    if (map.loaded() && !map.isMoving()) {
      resolve()
      return
    }
    map.once('idle', () => resolve())
  })
}

export function waitForMapIdleOrTimeout(map: Map, timeoutMs: number): Promise<void> {
  return Promise.race([
    waitForMapIdle(map),
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, timeoutMs)
    }),
  ])
}
