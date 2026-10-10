import type { Map, PaddingOptions } from 'mapbox-gl'
import { useCallback, useEffect, useRef } from 'react'
import { useFloatingWindowsState } from '../floating-windows/floatingWindowsHooks'
import type { MapHighlightPlace } from './mapAgentHighlight'
import { fitMapToAgentPlaces } from './mapAgentFitPlaces'
import { stopAgentPlaceOrbit } from './mapPlaceOrbit'
import { computeRouteFitPadding } from './routeFitPadding'

export function useAgentCompareMapRefit(map: Map | null, mapPhase: string) {
  const comparePlacesRef = useRef<MapHighlightPlace[] | null>(null)
  const floatingWindows = useFloatingWindowsState()
  const floatingWindowsRef = useRef(floatingWindows)
  floatingWindowsRef.current = floatingWindows

  const fitPadding = useCallback((): PaddingOptions | undefined => {
    if (!map) return undefined
    const canvas = map.getCanvas()
    return computeRouteFitPadding(
      canvas.clientWidth,
      canvas.clientHeight,
      floatingWindowsRef.current,
    )
  }, [map])

  const setComparePlaces = useCallback((places: MapHighlightPlace[] | null) => {
    comparePlacesRef.current = places
  }, [])

  useEffect(() => {
    if (!map || mapPhase === 'loading') return
    const places = comparePlacesRef.current
    if (!places || places.length < 2) return
    stopAgentPlaceOrbit(map)
    void fitMapToAgentPlaces(map, places, fitPadding())
  }, [map, mapPhase, floatingWindows, fitPadding])

  useEffect(() => {
    if (!map || mapPhase === 'loading') return
    let resizeTimer: number | undefined
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const places = comparePlacesRef.current
        if (!places || places.length < 2) return
        stopAgentPlaceOrbit(map)
        void fitMapToAgentPlaces(map, places, fitPadding())
      }, 220)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [map, mapPhase, fitPadding])

  return { setComparePlaces, fitPadding }
}
