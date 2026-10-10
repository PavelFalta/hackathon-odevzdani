import { useEffect } from 'react'
import { bindAgentPlaceOrbitHandoff } from './mapAgentPlaceOrbitHandoff'
import { bindAgentPlaceOrbitMap } from './mapPlaceOrbit'
import { useMapController } from './MapContext'

export function AgentPlaceOrbitHandoffBridge() {
  const { map, phase } = useMapController()

  useEffect(() => {
    bindAgentPlaceOrbitMap(map)
    return () => bindAgentPlaceOrbitMap(null)
  }, [map])

  useEffect(() => {
    if (!map || phase === 'loading') return
    return bindAgentPlaceOrbitHandoff(map)
  }, [map, phase])

  return null
}
