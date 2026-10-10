import { agentActionsRef } from '../agent/agentActionsRef'
import type { MapAppearancePatch } from '../agent/agentActionsRef'
import { parseMapTimeArgs } from '../../map/mapTimeWheelAgent'
import { runKnowledgeTool } from './runKnowledgeTool'
import { runWebSearchTool } from './runWebSearchTool'
import { runMapboxCategoryTool, runMapboxReverseTool, runMapboxSearchTool } from './runMapboxTool'

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function runAgentTool(name: string, argumentsJson: string): Promise<string> {
  const actions = agentActionsRef.current

  if (name === 'search_web') {
    return runWebSearchTool(argumentsJson)
  }

  if (name === 'show_timetable') {
    if (!actions.showTimetable) return JSON.stringify({ error: 'timetable_unavailable' })
    return actions.showTimetable(argumentsJson)
  }

  if (name === 'search_regional_knowledge') {
    return actions.searchKnowledge
      ? actions.searchKnowledge(argumentsJson)
      : runKnowledgeTool(argumentsJson)
  }

  if (name === 'search_mapbox') {
    return runMapboxSearchTool(argumentsJson)
  }

  if (name === 'search_mapbox_category') {
    return runMapboxCategoryTool(argumentsJson)
  }

  if (name === 'reverse_geocode_mapbox') {
    return runMapboxReverseTool(argumentsJson)
  }

  if (name === 'open_website') {
    const args = parseJson<{ url?: string }>(argumentsJson)
    const url = args?.url?.trim()
    if (!url) return JSON.stringify({ error: 'url_required' })
    if (!actions.openWebsite) return JSON.stringify({ error: 'browser_unavailable' })
    return actions.openWebsite(url)
  }

  if (name === 'fetch_place_reviews') {
    const args = parseJson<{ query?: string }>(argumentsJson)
    const query = args?.query?.trim()
    if (!query) return JSON.stringify({ error: 'query_required' })
    if (!actions.fetchPlaceReviews) return JSON.stringify({ error: 'reviews_unavailable' })
    return actions.fetchPlaceReviews(query)
  }

  if (name === 'highlight_place_options') {
    const args = parseJson<{ places?: { lon?: number; lat?: number; name?: string }[] }>(
      argumentsJson,
    )
    const places =
      args?.places
        ?.filter((p) => p.lon !== undefined && p.lat !== undefined && p.name?.trim())
        .map((p) => ({ lon: p.lon as number, lat: p.lat as number, label: p.name!.trim() })) ?? []
    if (places.length < 2) return JSON.stringify({ error: 'need_at_least_two_places' })
    if (!actions.highlightPlaceOptions) return JSON.stringify({ error: 'map_unavailable' })
    return actions.highlightPlaceOptions(places)
  }

  if (name === 'fly_to_place') {
    const args = parseJson<{ lon?: number; lat?: number; name?: string; zoom?: number }>(
      argumentsJson,
    )
    if (args?.lon === undefined || args?.lat === undefined) {
      return JSON.stringify({ error: 'coordinates_required' })
    }
    if (!actions.flyToPlace) return JSON.stringify({ error: 'map_unavailable' })
    return actions.flyToPlace(args.lon, args.lat, args.name, args.zoom)
  }

  if (name === 'set_map_appearance') {
    const patch = parseJson<MapAppearancePatch>(argumentsJson)
    if (!patch) return JSON.stringify({ error: 'invalid_arguments' })
    if (!actions.setMapAppearance) return JSON.stringify({ error: 'map_unavailable' })
    return actions.setMapAppearance(patch)
  }

  if (name === 'set_map_time') {
    const parsed = parseMapTimeArgs(
      parseJson<{ hour?: number; minute?: number; time?: string }>(argumentsJson),
    )
    if ('error' in parsed) return JSON.stringify({ error: parsed.error })
    if (!actions.setMapTime) return JSON.stringify({ error: 'map_unavailable' })
    const hour = Math.floor(parsed.minutes / 60)
    const minute = parsed.minutes % 60
    return actions.setMapTime(hour, minute)
  }

  if (name === 'map_view_preset') {
    const args = parseJson<{ preset?: 'whole_kraj' | 'cheb' }>(argumentsJson)
    if (!args?.preset) return JSON.stringify({ error: 'preset_required' })
    if (!actions.mapViewPreset) return JSON.stringify({ error: 'map_unavailable' })
    return actions.mapViewPreset(args.preset)
  }

  if (name === 'get_user_location') {
    if (!actions.getUserLocation) return JSON.stringify({ error: 'location_unavailable' })
    return actions.getUserLocation()
  }

  if (name === 'set_user_location') {
    const args = parseJson<{ query?: string }>(argumentsJson)
    const query = args?.query?.trim()
    if (!query) return JSON.stringify({ error: 'query_required' })
    if (!actions.setUserLocation) return JSON.stringify({ error: 'location_unavailable' })
    return actions.setUserLocation(query)
  }

  if (name === 'list_open_windows') {
    if (!actions.listOpenWindows) return JSON.stringify({ error: 'windows_unavailable' })
    return actions.listOpenWindows()
  }

  if (name === 'close_window') {
    const args = parseJson<{ window_id?: string }>(argumentsJson)
    const windowId = args?.window_id?.trim()
    if (!windowId) return JSON.stringify({ error: 'window_id_required' })
    if (!actions.closeUiWindow) return JSON.stringify({ error: 'windows_unavailable' })
    return actions.closeUiWindow(windowId)
  }

  if (name === 'plan_route') {
    if (!actions.planRoute) return JSON.stringify({ error: 'navigation_unavailable' })
    return actions.planRoute(argumentsJson)
  }

  if (name === 'open_google_maps_route') {
    if (!actions.openGoogleMapsRoute) {
      return JSON.stringify({ error: 'navigation_unavailable' })
    }
    return actions.openGoogleMapsRoute(argumentsJson)
  }

  if (name === 'export_route_steps') {
    if (!actions.exportRouteSteps) return JSON.stringify({ error: 'navigation_unavailable' })
    return actions.exportRouteSteps(argumentsJson)
  }

  if (name === 'export_route_map_screenshot') {
    if (!actions.exportRouteMapScreenshot) {
      return JSON.stringify({ error: 'navigation_unavailable' })
    }
    return actions.exportRouteMapScreenshot(argumentsJson)
  }

  return JSON.stringify({ error: 'unknown_tool', name })
}
