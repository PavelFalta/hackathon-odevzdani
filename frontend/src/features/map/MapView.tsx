import 'mapbox-gl/dist/mapbox-gl.css'
import { MapBootOverlay } from './MapBootOverlay'
import { MapNavigationControls } from './MapNavigationControls'
import { MapTimeWheel } from './MapTimeWheel'
import { MapAgentBridge } from '../assistant/agent/MapAgentBridge'
import { UserLocationAgentBridge } from '../assistant/agent/UserLocationAgentBridge'
import { AgentPlaceOrbitHandoffBridge } from './AgentPlaceOrbitHandoffBridge'
import { UserLocationMapBridge } from './userLocation/UserLocationMapBridge'
import './map.css'

type MapViewProps = {
  className?: string
}

export function MapView({ className }: MapViewProps) {
  const token = import.meta.env.VITE_MAPBOX_TOKEN

  if (!token) {
    return (
      <div className="map-unavailable" data-testid="map-unavailable">
        <p>
          Nastav <code>VITE_MAPBOX_TOKEN</code> pro načtení 3D podkladové mapy.
        </p>
      </div>
    )
  }

  return (
    <>
      <MapAgentBridge />
      <UserLocationAgentBridge />
      <AgentPlaceOrbitHandoffBridge />
      <UserLocationMapBridge />
      <div className={className ?? 'map-shell'}>
        <MapBootOverlay />
        <MapTimeWheel />
        <MapNavigationControls />
      </div>
    </>
  )
}
