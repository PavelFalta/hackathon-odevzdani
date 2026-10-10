import type { BasemapAppearance, LightPreset } from '../../map/basemapStyle'

export type AssistantPlacePin = {
  label: string
  lon: number
  lat: number
}

export type MapAppearancePatch = {
  light_preset?: LightPreset
  basemap_appearance?: BasemapAppearance
  terrain_exaggeration?: number
  show_3d_objects?: boolean
}

export type AgentActions = {
  searchKnowledge: (argumentsJson: string) => Promise<string>
  openWebsite: (url: string) => Promise<string>
  fetchPlaceReviews: (query: string) => Promise<string>
  listOpenWindows: () => Promise<string>
  closeUiWindow: (windowId: string) => Promise<string>
  flyToPlace: (lon: number, lat: number, name?: string, zoom?: number) => Promise<string>
  setMapAppearance: (patch: MapAppearancePatch) => Promise<string>
  setMapTime: (hour: number, minute: number) => Promise<string>
  mapViewPreset: (preset: 'whole_kraj' | 'cheb') => Promise<string>
  getMapViewport: () => Promise<string>
  getUserLocation: () => Promise<string>
  setUserLocation: (query: string) => Promise<string>
  showAssistantPlaces: (places: AssistantPlacePin[], primaryIndex?: number) => Promise<string>
  highlightPlaceOptions: (places: AssistantPlacePin[]) => Promise<string>
  planRoute: (argumentsJson: string) => Promise<string>
  openGoogleMapsRoute: (argumentsJson: string) => Promise<string>
  exportRouteSteps: (argumentsJson: string) => Promise<string>
  exportRouteMapScreenshot: (argumentsJson: string) => Promise<string>
  showTimetable: (argumentsJson: string) => Promise<string>
}

export const agentActionsRef: { current: Partial<AgentActions> } = { current: {} }

export function registerAgentAction<K extends keyof AgentActions>(
  key: K,
  fn: AgentActions[K],
): () => void {
  agentActionsRef.current[key] = fn
  return () => {
    delete agentActionsRef.current[key]
  }
}
