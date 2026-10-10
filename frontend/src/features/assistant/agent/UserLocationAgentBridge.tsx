import { useEffect } from 'react'
import { registerAgentAction } from './agentActionsRef'
import { buildUserLocationAgentSnapshot } from '../../map/userLocation/userLocationAgentSnapshot'
import { useUserLocationOptional } from '../../map/userLocation/UserLocationContext'

export function UserLocationAgentBridge() {
  const userLocation = useUserLocationOptional()

  useEffect(() => {
    if (!userLocation) return undefined

    const unregisters = [
      registerAgentAction('getUserLocation', async () => {
        const snapshot = buildUserLocationAgentSnapshot({
          fix: userLocation.fix,
          resolving: userLocation.resolving,
          autoResolveHint: userLocation.autoResolveHint,
        })
        return JSON.stringify(snapshot)
      }),
      registerAgentAction('setUserLocation', async (query: string) => {
        const result = await userLocation.setFromPlaceQuery(query)
        return JSON.stringify(result)
      }),
    ]

    return () => {
      for (const unregister of unregisters) unregister()
    }
  }, [userLocation])

  return null
}
