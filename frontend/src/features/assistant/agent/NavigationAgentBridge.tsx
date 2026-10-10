import { useEffect } from 'react'
import { useNavigation } from '../../navigation/NavigationContext'
import { resolveNavigationPlan } from '../../navigation/resolveNavigationPlan'
import type { NavigationRouteRequest } from '../../navigation/navigationTypes'
import { agentActionsRef, registerAgentAction } from './agentActionsRef'
import { buildGoogleMapsRouteUrl } from '../../navigation/googleMapsRouteUrl'
import { openGoogleMapsTab } from '../../navigation/openGoogleMapsTab'
import {
  agentExportRouteScreenshot,
  agentExportRouteSteps,
} from '../../navigation/navigationAgentExport'
import { formatRouteDistance, formatRouteDuration } from '../../navigation/navigationFormat'

function parsePlanRouteArgs(raw: string): NavigationRouteRequest | null {
  try {
    const args = JSON.parse(raw) as Record<string, unknown>
    const destination = typeof args.destination === 'string' ? args.destination.trim() : ''
    if (!destination) return null
    const profile =
      args.profile === 'walking' || args.profile === 'cycling' || args.profile === 'driving'
        ? args.profile
        : undefined
    return {
      destination,
      origin: typeof args.origin === 'string' ? args.origin.trim() : undefined,
      useUserLocation: args.use_user_location === true,
      fromLon: typeof args.from_lon === 'number' ? args.from_lon : undefined,
      fromLat: typeof args.from_lat === 'number' ? args.from_lat : undefined,
      fromName: typeof args.from_name === 'string' ? args.from_name : undefined,
      toLon: typeof args.to_lon === 'number' ? args.to_lon : undefined,
      toLat: typeof args.to_lat === 'number' ? args.to_lat : undefined,
      toName: typeof args.to_name === 'string' ? args.to_name : undefined,
      profile,
    }
  } catch {
    return null
  }
}

export function NavigationAgentBridge() {
  const navigation = useNavigation()

  useEffect(() => {
    const unregisters = [
      registerAgentAction('planRoute', async (argumentsJson) => {
        const request = parsePlanRouteArgs(argumentsJson)
        if (!request) return JSON.stringify({ ok: false, error: 'invalid_arguments' })
        const getUserLocation = agentActionsRef.current.getUserLocation
        if (!getUserLocation) return JSON.stringify({ ok: false, error: 'location_unavailable' })

        const windowId = navigation.open(request)
        try {
          const plan = await resolveNavigationPlan(request, getUserLocation)
          navigation.setPanelState(windowId, { status: 'ready', plan })
          const preview = plan.steps.slice(0, 4).map((s) => s.instruction)
          const google_maps_url = buildGoogleMapsRouteUrl({
            fromLat: plan.fromLat,
            fromLon: plan.fromLon,
            toLat: plan.toLat,
            toLon: plan.toLon,
            profile: plan.profile,
          })
          return JSON.stringify({
            ok: true,
            window_id: windowId,
            from: plan.fromLabel,
            to: plan.toLabel,
            profile: plan.profile,
            distance_m: plan.distance_m,
            duration_s: plan.duration_s,
            distance_text: formatRouteDistance(plan.distance_m),
            duration_text: formatRouteDuration(plan.duration_s),
            step_count: plan.steps.length,
            first_steps: preview,
            google_maps_url,
            offer_google_maps: true,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Nepodařilo se naplánovat trasu.'
          navigation.setPanelState(windowId, { status: 'error', message })
          return JSON.stringify({ ok: false, error: message, window_id: windowId })
        }
      }),
      registerAgentAction('openGoogleMapsRoute', async (argumentsJson) => {
        let url = ''
        try {
          const args = JSON.parse(argumentsJson) as Record<string, unknown>
          if (typeof args.google_maps_url === 'string') {
            url = args.google_maps_url.trim()
          } else if (
            typeof args.from_lon === 'number' &&
            typeof args.from_lat === 'number' &&
            typeof args.to_lon === 'number' &&
            typeof args.to_lat === 'number'
          ) {
            const profile =
              args.profile === 'walking' || args.profile === 'cycling' ? args.profile : 'driving'
            url = buildGoogleMapsRouteUrl({
              fromLon: args.from_lon,
              fromLat: args.from_lat,
              toLon: args.to_lon,
              toLat: args.to_lat,
              profile,
            })
          }
        } catch {
          return JSON.stringify({ ok: false, error: 'invalid_arguments' })
        }
        if (!openGoogleMapsTab(url)) {
          return JSON.stringify({ ok: false, error: 'url_required' })
        }
        return JSON.stringify({ ok: true, url })
      }),
      registerAgentAction('exportRouteSteps', async (argumentsJson) => {
        return agentExportRouteSteps(navigation.panels, argumentsJson)
      }),
      registerAgentAction('exportRouteMapScreenshot', async (argumentsJson) => {
        return agentExportRouteScreenshot(navigation.panels, argumentsJson)
      }),
    ]
    return () => {
      for (const unregister of unregisters) unregister()
    }
  }, [navigation])

  return null
}
