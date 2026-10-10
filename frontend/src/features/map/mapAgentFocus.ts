import type { Map, PaddingOptions } from 'mapbox-gl'
import { cinematicFlyTo } from './mapCinematic'
import { selectAgentBuildingAtPlace } from './mapAgentBuildingSelect'
import { fitMapToAgentPlaces } from './mapAgentFitPlaces'
import { setAgentMapHighlights, type MapHighlightPlace } from './mapAgentHighlight'
import { isNavigationSessionActive } from './mapNavigationSession'
import { isAgentPlaceOrbitEnabled } from './agentPlaceOrbitPref'
import { startAgentPlaceOrbit, stopAgentPlaceOrbit } from './mapPlaceOrbit'

export type AgentMapFocusMode = 'focus' | 'compare'

export type AgentMapFocusOptions = {
  zoom?: number
  mode?: AgentMapFocusMode
  tryBuildingSelect?: boolean
  fitPadding?: PaddingOptions
}

export async function focusAgentMapPlaces(
  map: Map,
  places: MapHighlightPlace[],
  primaryIndex = 0,
  options: AgentMapFocusOptions = {},
) {
  if (!places.length) return
  const mode = options.mode ?? (places.length > 1 ? 'compare' : 'focus')
  stopAgentPlaceOrbit(map)
  setAgentMapHighlights(map, places, primaryIndex)

  if (mode === 'compare') {
    map.jumpTo({ pitch: 0 })
    await fitMapToAgentPlaces(map, places, options.fitPadding)
    return
  }

  const focus = places[primaryIndex] ?? places[0]
  await cinematicFlyTo(map, focus.lon, focus.lat, options.zoom)
  if (options.tryBuildingSelect !== false) {
    const trySelect = () => selectAgentBuildingAtPlace(map, focus.lon, focus.lat)
    if (!trySelect()) map.once('idle', trySelect)
  }
  if (!isNavigationSessionActive() && isAgentPlaceOrbitEnabled()) {
    startAgentPlaceOrbit(map, focus.lon, focus.lat)
  }
}
