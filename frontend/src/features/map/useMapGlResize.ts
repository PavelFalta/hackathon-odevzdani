import { useEffect, type RefObject } from 'react'
import type { Map } from 'mapbox-gl'

/** Fixed map host does not always emit window resize; observe the canvas container. */
export function useMapGlResize(map: Map | null, containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = containerRef.current
    if (!map || !el) return

    let lastW = 0
    let lastH = 0
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w < 1 || h < 1 || (w === lastW && h === lastH)) return
      lastW = w
      lastH = h
      map.resize()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [map, containerRef])
}
