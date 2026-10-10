import { mapSearchCategory, mapSearchForward, mapSearchReverse } from '../../../api/mapSearch'
import { onlineDataSource } from './agentDataSource'
import { resolveToolUserProximity } from './toolUserProximity'

type ProximityArgs = { near_lon?: number; near_lat?: number }

async function withMapViewport(args: ProximityArgs): Promise<ProximityArgs> {
  const proximity = await resolveToolUserProximity(args)
  if (!proximity.user_location) return args
  return { near_lon: proximity.near_lon, near_lat: proximity.near_lat }
}

const NEARBY_CATEGORY_MAX_M = 55_000

function sortHitsByDistance<T extends { distance_m?: number | null }>(hits: T[]): T[] {
  return [...hits].sort((a, b) => {
    const da = a.distance_m ?? Number.POSITIVE_INFINITY
    const db = b.distance_m ?? Number.POSITIVE_INFINITY
    return da - db
  })
}

function filterNearbyCategoryHits<T extends { distance_m?: number | null }>(
  hits: T[],
  userLocation: boolean,
): T[] {
  if (!userLocation) return hits
  const sorted = sortHitsByDistance(hits)
  const nearby = sorted.filter(
    (hit) =>
      hit.distance_m === null ||
      hit.distance_m === undefined ||
      hit.distance_m <= NEARBY_CATEGORY_MAX_M,
  )
  return nearby.length > 0 ? nearby : sorted.slice(0, Math.min(4, sorted.length))
}

function toolError(code: string): string {
  return JSON.stringify({ error: code })
}

export async function runMapboxSearchTool(argumentsJson: string): Promise<string> {
  let args: {
    query?: string
    limit?: number
    near_lon?: number
    near_lat?: number
    types?: string
  }
  try {
    args = JSON.parse(argumentsJson) as typeof args
  } catch {
    return toolError('invalid_arguments')
  }
  const query = args.query?.trim()
  if (!query) return toolError('query_required')
  const userProximity = await resolveToolUserProximity(args)
  const proximity = await withMapViewport(args)
  try {
    const result = await mapSearchForward({
      query,
      limit: args.limit,
      near_lon: proximity.near_lon,
      near_lat: proximity.near_lat,
      types: args.types?.trim() || undefined,
    })
    const hits = userProximity.user_location ? sortHitsByDistance(result.hits) : result.hits
    return JSON.stringify({
      ...result,
      data_source: onlineDataSource(hits.length > 0),
      hits,
    })
  } catch {
    return toolError('mapbox_search_failed')
  }
}

export async function runMapboxCategoryTool(argumentsJson: string): Promise<string> {
  let args: { category_id?: string; limit?: number; near_lon?: number; near_lat?: number }
  try {
    args = JSON.parse(argumentsJson) as typeof args
  } catch {
    return toolError('invalid_arguments')
  }
  const categoryId = args.category_id?.trim()
  if (!categoryId) return toolError('category_id_required')
  const userProximity = await resolveToolUserProximity(args)
  const proximity = await withMapViewport(args)
  try {
    const result = await mapSearchCategory({
      category_id: categoryId,
      limit: args.limit,
      near_lon: proximity.near_lon,
      near_lat: proximity.near_lat,
    })
    const hits = filterNearbyCategoryHits(result.hits, userProximity.user_location)
    return JSON.stringify({
      ...result,
      data_source: onlineDataSource(hits.length > 0),
      hit_count: hits.length,
      hits,
    })
  } catch {
    return toolError('mapbox_search_failed')
  }
}

export async function runMapboxReverseTool(argumentsJson: string): Promise<string> {
  let args: { lon?: number; lat?: number; limit?: number }
  try {
    args = JSON.parse(argumentsJson) as typeof args
  } catch {
    return toolError('invalid_arguments')
  }
  if (args.lon === undefined || args.lat === undefined) {
    return toolError('coordinates_required')
  }
  try {
    const result = await mapSearchReverse({
      lon: args.lon,
      lat: args.lat,
      limit: args.limit,
    })
    const hits = result.hits ?? []
    return JSON.stringify({
      ...result,
      data_source: onlineDataSource(hits.length > 0),
    })
  } catch {
    return toolError('mapbox_search_failed')
  }
}
