import { beforeEach, describe, expect, it } from 'vitest'
import { agentActionsRef } from '../agent/agentActionsRef'
import { runAgentTool } from './runAgentTool'

describe('runAgentTool user location', () => {
  beforeEach(() => {
    delete agentActionsRef.current.getUserLocation
    delete agentActionsRef.current.setUserLocation
  })

  it('get_user_location delegates to client action', async () => {
    agentActionsRef.current.getUserLocation = async () =>
      JSON.stringify({ has_fix: true, lon: 12, lat: 50 })
    const out = JSON.parse(await runAgentTool('get_user_location', '{}')) as { has_fix: boolean }
    expect(out.has_fix).toBe(true)
  })

  it('set_user_location requires query', async () => {
    const out = JSON.parse(await runAgentTool('set_user_location', '{}')) as { error: string }
    expect(out.error).toBe('query_required')
  })
})
