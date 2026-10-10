import { useEffect, useRef } from 'react'
import { useMapController } from '../MapContext'
import { cinematicFlyTo } from '../mapCinematic'
import { startUserLocationMapPulse, stopUserLocationMapPulse } from './userLocationMapPulse'
import { clearUserLocationMapMarker, syncUserLocationMapMarker } from './userLocationMapMarker'
import { useUserLocationOptional } from './UserLocationContext'

export function UserLocationMapBridge() {
  const { map, phase } = useMapController()
  const userLocation = useUserLocationOptional()
  const flownKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!map || phase !== 'ready') return undefined
    const fix = userLocation?.fix ?? null
    syncUserLocationMapMarker(map, fix)
    if (fix) startUserLocationMapPulse(map)
    else stopUserLocationMapPulse()
    return () => {
      stopUserLocationMapPulse()
      clearUserLocationMapMarker(map)
    }
  }, [map, phase, userLocation?.fix])

  useEffect(() => {
    const fix = userLocation?.fix
    if (!map || phase !== 'ready' || !fix) return

    const key = `${fix.lon.toFixed(5)},${fix.lat.toFixed(5)}`
    if (flownKeyRef.current === key) return
    flownKeyRef.current = key
    void cinematicFlyTo(map, fix.lon, fix.lat, 15.2)
  }, [map, phase, userLocation?.fix])

  return null
}
