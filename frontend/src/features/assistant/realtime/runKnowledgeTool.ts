import { searchKnowledge } from '../../../api/knowledge'
import { haversineKm } from '../../map/geo/haversineKm'
import { openDataSource } from './agentDataSource'
import { autoOpenForSingleKnowledgeHit } from './knowledgeAutoOpen'
import { DEFAULT_NEARBY_RADIUS_KM, resolveToolUserProximity } from './toolUserProximity'

type ToolArgs = {
  query?: string
  limit?: number
  near_lon?: number
  near_lat?: number
  radius_km?: number
  widen_search?: boolean
}

function recordCoords(record: Record<string, unknown>): { lon: number; lat: number } | null {
  const lon = record.lon
  const lat = record.lat
  if (typeof lon !== 'number' || typeof lat !== 'number') return null
  return { lon, lat }
}

export async function runKnowledgeTool(argumentsJson: string): Promise<string> {
  let args: ToolArgs
  try {
    args = JSON.parse(argumentsJson) as ToolArgs
  } catch {
    return JSON.stringify({ error: 'invalid_arguments' })
  }
  const query = args.query?.trim()
  if (!query) {
    return JSON.stringify({ error: 'query_required' })
  }
  const limit = Math.min(12, Math.max(1, args.limit ?? 6))
  const proximity = await resolveToolUserProximity(args)
  const radiusKm =
    args.widen_search || !proximity.user_location
      ? args.radius_km
      : (args.radius_km ?? DEFAULT_NEARBY_RADIUS_KM)

  try {
    const result = await searchKnowledge({
      query,
      limit,
      near_lon: proximity.near_lon,
      near_lat: proximity.near_lat,
      radius_km: radiusKm,
    })
    const anchor =
      proximity.near_lon !== undefined && proximity.near_lat !== undefined
        ? { lon: proximity.near_lon, lat: proximity.near_lat }
        : null

    const hits = result.hits.map((hit) => {
      const coords = recordCoords(hit.record)
      const distance_km =
        anchor && coords ? haversineKm(anchor.lon, anchor.lat, coords.lon, coords.lat) : null
      return {
        score: hit.score,
        distance_km: distance_km !== null ? Math.round(distance_km * 10) / 10 : null,
        name: hit.record.name,
        web: hit.record.web,
        dataset_slug: hit.record.dataset_slug,
        lon: hit.record.lon,
        lat: hit.record.lat,
      }
    })

    const loneHit = result.hits.length === 1 ? result.hits[0] : null
    const autoOpened = loneHit ? await autoOpenForSingleKnowledgeHit([loneHit]) : null

    return JSON.stringify({
      data_source: openDataSource(hits.length > 0),
      total_indexed: result.total_indexed,
      hit_count: hits.length,
      proximity: proximity.user_location
        ? {
            near_lon: proximity.near_lon,
            near_lat: proximity.near_lat,
            radius_km: radiusKm ?? null,
          }
        : null,
      context: result.context,
      auto_opened: autoOpened,
      hits,
    })
  } catch {
    return JSON.stringify({ error: 'knowledge_search_failed' })
  }
}
