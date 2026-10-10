import { agentActionsRef } from '../agent/agentActionsRef'

export type ToolUserProximity = {
  near_lon?: number
  near_lat?: number
  user_location: boolean
}

/** Default knowledge radius when the user has a fix and did not ask for a wide search. */
export const DEFAULT_NEARBY_RADIUS_KM = 45

export async function resolveToolUserProximity(args: {
  near_lon?: number
  near_lat?: number
}): Promise<ToolUserProximity> {
  if (args.near_lon !== undefined && args.near_lat !== undefined) {
    return { near_lon: args.near_lon, near_lat: args.near_lat, user_location: true }
  }
  const viewport = agentActionsRef.current.getMapViewport
  if (!viewport) return { user_location: false }
  try {
    const parsed = JSON.parse(await viewport()) as {
      near_lon?: number
      near_lat?: number
      user_location?: boolean
    }
    if (!parsed.user_location) return { user_location: false }
    if (parsed.near_lon === undefined || parsed.near_lat === undefined) {
      return { user_location: false }
    }
    return {
      near_lon: parsed.near_lon,
      near_lat: parsed.near_lat,
      user_location: true,
    }
  } catch {
    return { user_location: false }
  }
}
