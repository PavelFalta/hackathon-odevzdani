import { beforeEach, describe, expect, it, vi } from 'vitest'
import { agentActionsRef } from '../agent/agentActionsRef'
import { runKnowledgeTool } from './runKnowledgeTool'

vi.mock('../../../api/knowledge', () => ({
  searchKnowledge: vi.fn(),
}))

import { searchKnowledge } from '../../../api/knowledge'

describe('runKnowledgeTool', () => {
  beforeEach(() => {
    vi.mocked(searchKnowledge).mockReset()
    delete agentActionsRef.current.getMapViewport
    delete agentActionsRef.current.fetchPlaceReviews
    delete agentActionsRef.current.openWebsite
  })

  it('applies default nearby radius when user location is known', async () => {
    agentActionsRef.current.getMapViewport = async () =>
      JSON.stringify({ near_lon: 12.87, near_lat: 50.23, user_location: true })
    vi.mocked(searchKnowledge).mockResolvedValue({
      hits: [],
      total_indexed: 10,
      context: null,
    })
    const out = await runKnowledgeTool(JSON.stringify({ query: 'hotel' }))
    expect(JSON.parse(out).data_source.disclosure_cs).toBeNull()
    expect(searchKnowledge).toHaveBeenCalledWith({
      query: 'hotel',
      limit: 6,
      near_lon: 12.87,
      near_lat: 50.23,
      radius_km: 45,
    })
  })

  it('skips radius when widen_search is true', async () => {
    agentActionsRef.current.getMapViewport = async () =>
      JSON.stringify({ near_lon: 12.87, near_lat: 50.23, user_location: true })
    vi.mocked(searchKnowledge).mockResolvedValue({
      hits: [],
      total_indexed: 10,
      context: null,
    })
    await runKnowledgeTool(JSON.stringify({ query: 'lázně', widen_search: true }))
    expect(searchKnowledge).toHaveBeenCalledWith({
      query: 'lázně',
      limit: 6,
      near_lon: 12.87,
      near_lat: 50.23,
      radius_km: undefined,
    })
  })
})
