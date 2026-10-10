import { postJson } from './client'

export type KnowledgeSearchBody = {
  query: string
  limit?: number
  min_lon?: number
  min_lat?: number
  max_lon?: number
  max_lat?: number
  near_lon?: number
  near_lat?: number
  radius_km?: number
}

export type KnowledgeHit = {
  score: number
  record: Record<string, unknown>
}

export type KnowledgeSearchResponse = {
  hits: KnowledgeHit[]
  total_indexed: number
  context: string | null
}

export async function searchKnowledge(body: KnowledgeSearchBody): Promise<KnowledgeSearchResponse> {
  return postJson<KnowledgeSearchResponse>('/api/knowledge/search', body, true)
}
