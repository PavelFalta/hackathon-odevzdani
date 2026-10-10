import { createContext, useContext, type ReactNode, type RefObject } from 'react'
import type { Map } from 'mapbox-gl'
import type { BasemapStyleState } from './basemapStyle'
import type { MapPerformanceMode } from './mapPerformanceMode'
import { useMapBootstrap } from './useMapBootstrap'

export type MapBootPhase = 'loading' | 'panorama' | 'ready'

export type MapContextValue = {
  map: Map | null
  phase: MapBootPhase
  /** 0–1 while the map is loading. */
  bootProgress: number
  style: BasemapStyleState
  setStyle: (patch: Partial<BasemapStyleState>) => void
  performanceMode: MapPerformanceMode
  setPerformanceMode: (mode: MapPerformanceMode) => void
  /** Slow orbit after the assistant zooms to a single place. */
  placeOrbitEnabled: boolean
  setPlaceOrbitEnabled: (enabled: boolean) => void
  resetChebView: () => void
  fitRegion: () => void
}

const MapContext = createContext<MapContextValue | null>(null)

export function MapProvider({
  containerRef,
  present = true,
  children,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  /** False while login is up, so the arrival waits until the shell can show it. */
  present?: boolean
  children: ReactNode
}) {
  const value = useMapBootstrap(containerRef, present)
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

export function useMapController() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapController outside MapProvider')
  return ctx
}

export function useMapControllerOptional() {
  return useContext(MapContext)
}
