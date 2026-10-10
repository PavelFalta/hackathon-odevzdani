import { postJson } from './client'

export type MapboxSearchResponse = {
  hit_count: number
  hits: Array<{
    name: string
    feature_type: string | null
    full_address: string | null
    lon: number
    lat: number
    distance_m: number | null
    mapbox_id: string | null
    poi_category: string[] | null
    website: string | null
  }>
}

export async function mapSearchForward(body: {
  query: string
  limit?: number
  near_lon?: number
  near_lat?: number
  types?: string
}): Promise<MapboxSearchResponse> {
  return postJson<MapboxSearchResponse>('/api/map/search/forward', body, true)
}

export async function mapSearchCategory(body: {
  category_id: string
  limit?: number
  near_lon?: number
  near_lat?: number
}): Promise<MapboxSearchResponse> {
  return postJson<MapboxSearchResponse>('/api/map/search/category', body, true)
}

export async function mapSearchReverse(body: {
  lon: number
  lat: number
  limit?: number
}): Promise<MapboxSearchResponse> {
  return postJson<MapboxSearchResponse>('/api/map/search/reverse', body, true)
}
