import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import mapboxgl from 'mapbox-gl'
import { applyBasemapStyle, basemapImportConfig, type BasemapStyleState } from './basemapStyle'
import { initialBasemapStyle } from './lightPresetWheel'
import { switchBasemapAppearance } from './mapStyleSwitch'
import { refreshMapGlAfterShow } from './mapReveal'
import { applyFogForPreset } from './mapTerrain'
import { applyRegionMaskStyle } from './regionMask'
import type { MapBootPhase, MapContextValue } from './MapContext'
import { runMapBootSequence } from './mapBootSequence'
import { applyKrajViewportLimits, watchKrajViewportLimits } from './mapViewportLimits'
import { applyRegionMaskProjection } from './regionMaskProjection'
import {
  basemapStyleForPerformanceMode,
  patchBasemapForPerformanceToggle,
  readStoredMapPerformanceMode,
  storeMapPerformanceMode,
  syncMapPerformanceModeView,
  type MapPerformanceMode,
  type SavedBasemap3dStyle,
} from './mapPerformanceMode'
import {
  readStoredAgentPlaceOrbit,
  setAgentPlaceOrbitEnabledPref,
} from './agentPlaceOrbitPref'
import { releaseAgentPlaceOrbit } from './mapPlaceOrbit'
import { CHEB_VIEW, KVK_BOUNDS, PANORAMA_START } from './region'

export function useMapBootstrap(
  containerRef: RefObject<HTMLDivElement | null>,
  present = true,
): MapContextValue {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const cancelledRef = useRef(false)
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
  const [phase, setPhase] = useState<MapBootPhase>('loading')
  const [bootProgress, setBootProgress] = useState(0)
  const initialPerformanceMode = readStoredMapPerformanceMode()
  const [performanceMode, setPerformanceModeState] =
    useState<MapPerformanceMode>(initialPerformanceMode)
  const [placeOrbitEnabled, setPlaceOrbitEnabledState] = useState(readStoredAgentPlaceOrbit)
  const saved3dRef = useRef<SavedBasemap3dStyle | null>(null)
  const [style, setStyleState] = useState<BasemapStyleState>(() =>
    basemapStyleForPerformanceMode(initialBasemapStyle(), initialPerformanceMode),
  )
  const presentRef = useRef(present)
  presentRef.current = present

  const applyStyle = useCallback((map: mapboxgl.Map, next: BasemapStyleState) => {
    applyBasemapStyle(map, next)
    applyFogForPreset(map, next.lightPreset)
    applyRegionMaskStyle(map, next.lightPreset)
  }, [])

  const setStyle = useCallback(
    (patch: Partial<BasemapStyleState>) => {
      setStyleState((prev) => {
        const next = { ...prev, ...patch }
        const map = mapRef.current
        if (!map) return next
        const appearanceChange =
          patch.basemapAppearance !== undefined &&
          patch.basemapAppearance !== prev.basemapAppearance
        if (appearanceChange) switchBasemapAppearance(map, next)
        else applyStyle(map, next)
        return next
      })
    },
    [applyStyle],
  )

  const setPlaceOrbitEnabled = useCallback((enabled: boolean) => {
    setPlaceOrbitEnabledState(enabled)
    setAgentPlaceOrbitEnabledPref(enabled)
    if (!enabled) releaseAgentPlaceOrbit()
  }, [])

  const setPerformanceMode = useCallback(
    (mode: MapPerformanceMode) => {
      setPerformanceModeState(mode)
      storeMapPerformanceMode(mode)
      setStyleState((prev) => {
        const { next, saved3d } = patchBasemapForPerformanceToggle(prev, mode, saved3dRef.current)
        saved3dRef.current = saved3d
        const map = mapRef.current
        if (map) {
          applyStyle(map, next)
          syncMapPerformanceModeView(map, mode)
        }
        return next
      })
    },
    [applyStyle],
  )

  const resetChebView = useCallback(() => {
    mapRef.current?.flyTo({ ...CHEB_VIEW, duration: 1800, essential: true })
  }, [])

  const fitRegion = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    map.fitBounds(KVK_BOUNDS, { padding: 48, duration: 2000, pitch: 45 })
    map.once('moveend', () => applyKrajViewportLimits(map))
  }, [])

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    const el = containerRef.current
    if (!token || !el) return

    cancelledRef.current = false
    mapboxgl.prewarm()
    mapboxgl.accessToken = token

    const perfModeAtBoot = readStoredMapPerformanceMode()
    const bootStyle = basemapStyleForPerformanceMode(initialBasemapStyle(), perfModeAtBoot)
    const map = new mapboxgl.Map({
      container: el,
      style: 'mapbox://styles/mapbox/standard',
      config: basemapImportConfig(bootStyle),
      center: PANORAMA_START.center,
      zoom: PANORAMA_START.zoom,
      pitch: 0,
      bearing: 0,
      antialias: true,
      preserveDrawingBuffer: true,
      maxBounds: KVK_BOUNDS,
      maxZoom: 18,
      projection: 'mercator',
    })
    applyRegionMaskProjection(map)
    mapRef.current = map
    setMapInstance(map)

    const stopViewportWatch = watchKrajViewportLimits(map)

    map.once('style.load', () => {
      applyKrajViewportLimits(map)
      void runMapBootSequence(
        map,
        setPhase,
        () => cancelledRef.current,
        setBootProgress,
        () => presentRef.current,
        bootStyle,
      ).then(() => {
        if (!cancelledRef.current) {
          applyKrajViewportLimits(map)
          refreshMapGlAfterShow(map, bootStyle)
          if (perfModeAtBoot === '2d') syncMapPerformanceModeView(map, '2d')
          setPhase('ready')
        }
      })
    })

    return () => {
      cancelledRef.current = true
      stopViewportWatch()
      map.remove()
      mapRef.current = null
      setMapInstance(null)
      setPhase('loading')
      setBootProgress(0)
    }
  }, [containerRef])

  return {
    map: mapInstance,
    phase,
    bootProgress,
    style,
    setStyle,
    performanceMode,
    setPerformanceMode,
    placeOrbitEnabled,
    setPlaceOrbitEnabled,
    resetChebView,
    fitRegion,
  }
}
