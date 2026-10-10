import type { DirectionsResponse, RouteProfile } from '../../api/mapDirections'

export type NavigationRouteRequest = {
  destination: string
  origin?: string
  useUserLocation?: boolean
  fromLon?: number
  fromLat?: number
  fromName?: string
  toLon?: number
  toLat?: number
  toName?: string
  profile?: RouteProfile
}

export type NavigationPlan = DirectionsResponse & {
  fromLabel: string
  toLabel: string
  fromLon: number
  fromLat: number
  toLon: number
  toLat: number
}

export type NavigationPlanState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; plan: NavigationPlan }

export type NavigationPanel = {
  id: string
  request: NavigationRouteRequest
  state: NavigationPlanState
}
