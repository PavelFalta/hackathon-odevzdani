import type { Map } from 'mapbox-gl'
import { useEffect, useMemo, useRef } from 'react'
import { useFloatingWindowsState } from '../floating-windows/floatingWindowsHooks'
import { syncAgentRouteLayer, type MapRouteDisplay } from '../map/mapAgentRouteLayer'
import { setNavigationSessionActive } from '../map/mapNavigationSession'
import { fitMapToRoute } from '../map/routeMapFit'
import { computeRouteFitPadding, routeFitPaddingKey } from '../map/routeFitPadding'
import { useMapControllerOptional } from '../map/MapContext'
import { setMapNavigationFlatView } from '../map/mapNavigationView'
import { navigationMapCaptureRef } from './navigationMapCaptureRef'
import { useNavigation } from './NavigationContext'

function captureMapPng(map: Map): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = map.getCanvas()
    const run = () => {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    }
    if (map.isStyleLoaded()) {
      map.once('render', run)
      map.triggerRepaint()
      return
    }
    map.once('idle', () => {
      map.once('render', run)
      map.triggerRepaint()
    })
  })
}

export function NavigationMapBridge() {
  const mapCtx = useMapControllerOptional()
  const { panels } = useNavigation()
  const floatingWindows = useFloatingWindowsState()
  const floatingWindowsRef = useRef(floatingWindows)
  floatingWindowsRef.current = floatingWindows
  const navigationActive = panels.length > 0
  const lastFittedIdRef = useRef<string | null>(null)

  const routePaddingKey = useMemo(() => {
    const map = mapCtx?.map
    if (!map || mapCtx?.phase === 'loading') return null
    const canvas = map.getCanvas()
    return routeFitPaddingKey(canvas.clientWidth, canvas.clientHeight, floatingWindows)
  }, [mapCtx?.map, mapCtx?.phase, floatingWindows])

  useEffect(() => {
    const map = mapCtx?.map
    if (!map || mapCtx?.phase === 'loading') return
    setNavigationSessionActive(map, navigationActive)
    setMapNavigationFlatView(map, navigationActive)
    return () => {
      setNavigationSessionActive(map, false)
      setMapNavigationFlatView(map, false)
    }
  }, [mapCtx?.map, mapCtx?.phase, navigationActive])

  useEffect(() => {
    const map = mapCtx?.map
    if (!map || mapCtx?.phase === 'loading') {
      navigationMapCaptureRef.current = null
      return
    }
    navigationMapCaptureRef.current = () => captureMapPng(map)
    return () => {
      navigationMapCaptureRef.current = null
    }
  }, [mapCtx?.map, mapCtx?.phase])

  useEffect(() => {
    const map = mapCtx?.map
    if (!map || mapCtx?.phase === 'loading') return

    const ready = panels.filter((p) => p.state.status === 'ready')
    const latest = ready[ready.length - 1]
    if (!latest || latest.state.status !== 'ready') {
      if (!navigationActive) {
        syncAgentRouteLayer(map, null)
        lastFittedIdRef.current = null
      }
      return
    }

    const plan = latest.state.plan
    const display: MapRouteDisplay = {
      geometry: plan.geometry,
      fromLon: plan.fromLon,
      fromLat: plan.fromLat,
      toLon: plan.toLon,
      toLat: plan.toLat,
      distanceM: plan.distance_m,
    }
    syncAgentRouteLayer(map, display)

    const refit = (force: boolean) => {
      if (!force && lastFittedIdRef.current === latest.id) return
      lastFittedIdRef.current = latest.id
      map.jumpTo({ pitch: 0 })
      const canvas = map.getCanvas()
      const padding = computeRouteFitPadding(
        canvas.clientWidth,
        canvas.clientHeight,
        floatingWindowsRef.current,
      )
      void fitMapToRoute(map, display, padding)
    }

    refit(true)
    const layoutTimer = window.setTimeout(() => refit(true), 520)

    let resizeTimer: number | undefined
    const scheduleRefit = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        lastFittedIdRef.current = null
        refit(true)
      }, 220)
    }
    window.addEventListener('resize', scheduleRefit)
    map.on('resize', scheduleRefit)
    return () => {
      window.clearTimeout(layoutTimer)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', scheduleRefit)
      map.off('resize', scheduleRefit)
    }
  }, [mapCtx?.map, mapCtx?.phase, panels, navigationActive])

  useEffect(() => {
    if (routePaddingKey === null) return
    const map = mapCtx?.map
    if (!map || mapCtx?.phase === 'loading') return

    const ready = panels.filter((p) => p.state.status === 'ready')
    const latest = ready[ready.length - 1]
    if (!latest || latest.state.status !== 'ready') return

    const timer = window.setTimeout(() => {
      const state = latest.state
      if (state.status !== 'ready') return
      const plan = state.plan
      const display: MapRouteDisplay = {
        geometry: plan.geometry,
        fromLon: plan.fromLon,
        fromLat: plan.fromLat,
        toLon: plan.toLon,
        toLat: plan.toLat,
        distanceM: plan.distance_m,
      }
      map.jumpTo({ pitch: 0 })
      const canvas = map.getCanvas()
      const padding = computeRouteFitPadding(
        canvas.clientWidth,
        canvas.clientHeight,
        floatingWindowsRef.current,
      )
      void fitMapToRoute(map, display, padding)
    }, 280)

    return () => window.clearTimeout(timer)
  }, [mapCtx?.map, mapCtx?.phase, panels, routePaddingKey])

  return null
}
