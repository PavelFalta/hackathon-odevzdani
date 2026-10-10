import { agentActionsRef } from './agent/agentActionsRef'

export async function goToPlaceOnMap(lon: number, lat: number, label: string): Promise<void> {
  const places = [{ label, lon, lat }]
  const show = agentActionsRef.current.showAssistantPlaces
  if (show) {
    await show(places, 0)
    return
  }
  const fly = agentActionsRef.current.flyToPlace
  if (!fly) return
  await fly(lon, lat, label)
}
