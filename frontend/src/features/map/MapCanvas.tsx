import { useEffect, useRef, type RefObject } from 'react'
import { useMapController } from './MapContext'
import { refreshMapGlAfterShow } from './mapReveal'

type MapCanvasProps = {
  containerRef: RefObject<HTMLDivElement | null>
  /** Hide the canvas during boot (login preload keeps it visible under the form). */
  cloakWhileLoading?: boolean
}

export function MapCanvas({ containerRef, cloakWhileLoading = true }: MapCanvasProps) {
  const { phase, map, style } = useMapController()
  const hidden = cloakWhileLoading && phase === 'loading'
  const wasLoadingRef = useRef(true)

  useEffect(() => {
    if (!map || phase === 'loading') return
    if (!wasLoadingRef.current) return
    wasLoadingRef.current = false
    refreshMapGlAfterShow(map, style)
  }, [map, phase, style])

  useEffect(() => {
    if (phase === 'loading') wasLoadingRef.current = true
  }, [phase])

  return (
    <div
      ref={containerRef}
      className={hidden ? 'map-canvas map-canvas--hidden' : 'map-canvas'}
      data-testid="map-canvas"
      aria-hidden={hidden}
    />
  )
}
