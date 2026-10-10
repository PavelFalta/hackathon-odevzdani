import { beforeEach, describe, expect, it, vi } from 'vitest'
import { agentActionsRef } from '../agent/agentActionsRef'
import { runMapboxSearchTool } from './runMapboxTool'

vi.mock('../../../api/mapSearch', () => ({
  mapSearchForward: vi.fn(),
  mapSearchCategory: vi.fn(),
  mapSearchReverse: vi.fn(),
}))

import { mapSearchForward } from '../../../api/mapSearch'

describe('runMapboxSearchTool', () => {
  beforeEach(() => {
    vi.mocked(mapSearchForward).mockReset()
    delete agentActionsRef.current.getMapViewport
  })

  it('requires query', async () => {
    const out = JSON.parse(await runMapboxSearchTool('{}')) as { error: string }
    expect(out.error).toBe('query_required')
  })

  it('passes user fix as proximity bias when user_location is true', async () => {
    agentActionsRef.current.getMapViewport = async () =>
      JSON.stringify({ near_lon: 12.5, near_lat: 50.1, user_location: true })
    vi.mocked(mapSearchForward).mockResolvedValue({ hit_count: 0, hits: [] })
    await runMapboxSearchTool(JSON.stringify({ query: 'kavárna' }))
    expect(mapSearchForward).toHaveBeenCalledWith({
      query: 'kavárna',
      limit: undefined,
      near_lon: 12.5,
      near_lat: 50.1,
      types: undefined,
    })
  })

  it('does not use map center when user_location is false', async () => {
    agentActionsRef.current.getMapViewport = async () =>
      JSON.stringify({ near_lon: 12.5, near_lat: 50.1, user_location: false })
    vi.mocked(mapSearchForward).mockResolvedValue({ hit_count: 0, hits: [] })
    await runMapboxSearchTool(JSON.stringify({ query: 'kavárna' }))
    expect(mapSearchForward).toHaveBeenCalledWith({
      query: 'kavárna',
      limit: undefined,
      near_lon: undefined,
      near_lat: undefined,
      types: undefined,
    })
  })
})
