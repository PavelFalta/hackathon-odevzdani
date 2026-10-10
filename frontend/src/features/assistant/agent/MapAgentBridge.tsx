import { useEffect, useRef } from 'react'
import { registerAgentAction, type MapAppearancePatch } from './agentActionsRef'
import { useMapController } from '../../map/MapContext'
import type { BasemapStyleState } from '../../map/basemapStyle'
import { focusAgentMapPlaces } from '../../map/mapAgentFocus'
import { markAgentToolMapFocusThisTurn } from '../../map/mapAgentToolFocusTurn'
import { useAgentCompareMapRefit } from '../../map/useAgentCompareMapRefit'
import { useUserLocationOptional } from '../../map/userLocation/UserLocationContext'
import { requestMapTimeWheelAnimate, wheelMinutesForLightPreset } from '../../map/mapTimeWheelAgent'
function appearanceToStyle(patch: MapAppearancePatch): Partial<BasemapStyleState> {
  const out: Partial<BasemapStyleState> = {}
  if (patch.light_preset) out.lightPreset = patch.light_preset
  if (patch.basemap_appearance) out.basemapAppearance = patch.basemap_appearance
  if (patch.terrain_exaggeration !== undefined) {
    out.terrainExaggeration = patch.terrain_exaggeration
  }
  if (patch.show_3d_objects !== undefined) out.show3dObjects = patch.show_3d_objects
  return out
}

export function MapAgentBridge() {
  const { map, phase, style, setStyle, fitRegion, resetChebView } = useMapController()
  const userLocation = useUserLocationOptional()
  const userFixRef = useRef(userLocation?.fix)
  userFixRef.current = userLocation?.fix
  const { setComparePlaces, fitPadding } = useAgentCompareMapRefit(map, phase)

  useEffect(() => {
    if (!map || phase === 'loading') return

    const tryBuildingSelect = style.basemapAppearance === 'standard'

    const unregisters = [
      registerAgentAction('flyToPlace', async (lon, lat, name, zoom) => {
        setComparePlaces(null)
        markAgentToolMapFocusThisTurn()
        await focusAgentMapPlaces(map, [{ lon, lat, label: name }], 0, {
          zoom,
          mode: 'focus',
          tryBuildingSelect,
        })
        return JSON.stringify({ ok: true, lon, lat, name: name ?? null })
      }),
      registerAgentAction('highlightPlaceOptions', async (places) => {
        if (places.length < 2) return JSON.stringify({ error: 'need_at_least_two_places' })
        setComparePlaces(places)
        markAgentToolMapFocusThisTurn()
        await focusAgentMapPlaces(map, places, 0, {
          mode: 'compare',
          fitPadding: fitPadding(),
          tryBuildingSelect: false,
        })
        return JSON.stringify({ ok: true, count: places.length })
      }),
      registerAgentAction('setMapAppearance', async (patch) => {
        const { light_preset, ...rest } = patch
        const stylePatch = appearanceToStyle(rest)
        if (Object.keys(stylePatch).length > 0) setStyle(stylePatch)
        if (light_preset) {
          requestMapTimeWheelAnimate(wheelMinutesForLightPreset(light_preset))
        }
        return JSON.stringify({ ok: true, applied: { ...stylePatch, light_preset } })
      }),
      registerAgentAction('setMapTime', async (hour, minute) => {
        const minutes = hour * 60 + minute
        const wheelAnimated = requestMapTimeWheelAnimate(minutes)
        const readout = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        return JSON.stringify({
          ok: true,
          time: readout,
          wheel_animated: wheelAnimated,
        })
      }),
      registerAgentAction('mapViewPreset', async (preset) => {
        if (preset === 'whole_kraj') fitRegion()
        else resetChebView()
        return JSON.stringify({ ok: true, preset })
      }),
      registerAgentAction('getMapViewport', async () => {
        const fix = userFixRef.current
        if (fix) {
          return JSON.stringify({
            near_lon: fix.lon,
            near_lat: fix.lat,
            zoom: map.getZoom(),
            user_location: true,
            label: fix.label ?? null,
          })
        }
        const center = map.getCenter()
        return JSON.stringify({
          near_lon: center.lng,
          near_lat: center.lat,
          zoom: map.getZoom(),
          user_location: false,
        })
      }),
    ]

    return () => {
      for (const unregister of unregisters) unregister()
    }
  }, [
    map,
    phase,
    style.basemapAppearance,
    setStyle,
    fitRegion,
    resetChebView,
    fitPadding,
    setComparePlaces,
  ])

  return null
}
