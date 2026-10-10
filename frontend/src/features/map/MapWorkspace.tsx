import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { MapCanvas } from './MapCanvas'
import { MapProvider, useMapController } from './MapContext'
import { useMapGlResize } from './useMapGlResize'
import { registerMapForFloatingPanelDrag } from './mapFloatingPanelDragGuard'
import './map-workspace.css'

type MapWorkspaceProps = {
  authenticated: boolean
  children: ReactNode
}

function MapFixedHost({
  authenticated,
  containerRef,
}: {
  authenticated: boolean
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const { map } = useMapController()
  useMapGlResize(map, containerRef)

  useEffect(() => {
    map?.resize()
  }, [authenticated, map])

  useEffect(() => {
    registerMapForFloatingPanelDrag(map)
    return () => registerMapForFloatingPanelDrag(null)
  }, [map])

  return (
    <div className="map-fixed-host" data-testid="map-fixed-host">
      <MapCanvas containerRef={containerRef} cloakWhileLoading={authenticated} />
    </div>
  )
}

export function MapWorkspace({ authenticated, children }: MapWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mode = authenticated ? 'shell' : 'login'

  return (
    <MapProvider containerRef={containerRef} present={authenticated}>
      <div className={`map-workspace map-workspace--${mode}`}>
        <MapFixedHost authenticated={authenticated} containerRef={containerRef} />
        {children}
      </div>
    </MapProvider>
  )
}
