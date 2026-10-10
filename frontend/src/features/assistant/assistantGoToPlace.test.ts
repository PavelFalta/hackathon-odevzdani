import { afterEach, describe, expect, it, vi } from 'vitest'
import { agentActionsRef } from './agent/agentActionsRef'
import { goToPlaceOnMap } from './assistantGoToPlace'

describe('goToPlaceOnMap', () => {
  afterEach(() => {
    agentActionsRef.current = {}
  })

  it('focuses a single place when a message link is clicked', async () => {
    const show = vi.fn().mockResolvedValue(JSON.stringify({ ok: true }))
    agentActionsRef.current.showAssistantPlaces = show

    await goToPlaceOnMap(12.37, 50.07, 'Hrad Cheb')

    expect(show).toHaveBeenCalledWith([{ label: 'Hrad Cheb', lon: 12.37, lat: 50.07 }], 0)
  })
})
