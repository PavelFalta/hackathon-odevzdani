import type { Map, MapboxGeoJSONFeature } from 'mapbox-gl'

const BUILDINGS_TARGET = { featuresetId: 'buildings', importId: 'basemap' }
export const AGENT_BUILDING_SELECT_COUNT = 2

type BuildingFeature = MapboxGeoJSONFeature & {
  id?: string | number
  geometry?: { type: string; coordinates?: unknown }
}

type MapWithFeaturesetQuery = Map & {
  queryRenderedFeatures(query: {
    target: { featuresetId: string; importId: string }
    filter?: unknown
  }): MapboxGeoJSONFeature[]
}

let selectedBuildings: MapboxGeoJSONFeature[] = []

function clearSelectedBuildings(map: Map) {
  for (const feature of selectedBuildings) {
    map.setFeatureState(feature, { select: false })
  }
  selectedBuildings = []
}

export function clearAgentBuildingSelection(map: Map) {
  clearSelectedBuildings(map)
}

function pointGeometry(lon: number, lat: number) {
  return { type: 'Point' as const, coordinates: [lon, lat] as [number, number] }
}

function queryBuildingsNear(map: Map, lon: number, lat: number, maxDistanceM: number) {
  const queryMap = map as MapWithFeaturesetQuery
  if (!queryMap.queryRenderedFeatures) return []
  try {
    return queryMap.queryRenderedFeatures({
      target: BUILDINGS_TARGET,
      filter: ['<=', ['distance', pointGeometry(lon, lat)], maxDistanceM],
    })
  } catch {
    return []
  }
}

function buildingGroup(feature: MapboxGeoJSONFeature): string | undefined {
  return (feature as { properties?: { group?: string } }).properties?.group
}

function asBuildingFeature(feature: MapboxGeoJSONFeature): BuildingFeature {
  return feature as BuildingFeature
}

function featureKey(feature: MapboxGeoJSONFeature): string {
  const f = asBuildingFeature(feature)
  const id = f.id
  if (id !== undefined && id !== null) return String(id)
  return JSON.stringify(f.geometry)
}

function ringCentroid(ring: number[][]): [number, number] {
  let sumLon = 0
  let sumLat = 0
  for (const [lon, lat] of ring) {
    sumLon += lon
    sumLat += lat
  }
  const n = ring.length
  return n ? [sumLon / n, sumLat / n] : [0, 0]
}

function featureLonLat(feature: MapboxGeoJSONFeature): [number, number] | null {
  const geometry = asBuildingFeature(feature).geometry
  if (!geometry) return null
  if (geometry.type === 'Point') {
    const coords = geometry.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return null
    return [coords[0] as number, coords[1] as number]
  }
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates
    if (!Array.isArray(rings) || !Array.isArray(rings[0]) || rings[0].length === 0) return null
    return ringCentroid(rings[0] as number[][])
  }
  return null
}

function distanceMeters(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const earthR = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * earthR * Math.asin(Math.sqrt(a))
}

function pickNearestBuildings(
  features: MapboxGeoJSONFeature[],
  lon: number,
  lat: number,
  maxCount: number,
): MapboxGeoJSONFeature[] {
  if (!features.length) return []
  const threeD = features.filter((f) => buildingGroup(f) === 'building-3d')
  const pool = threeD.length > 0 ? threeD : features
  const ranked = [...pool].sort((a, b) => {
    const aPos = featureLonLat(a)
    const bPos = featureLonLat(b)
    const aDist = aPos ? distanceMeters(lon, lat, aPos[0], aPos[1]) : Infinity
    const bDist = bPos ? distanceMeters(lon, lat, bPos[0], bPos[1]) : Infinity
    return aDist - bDist
  })
  const seen = new Set<string>()
  const picked: MapboxGeoJSONFeature[] = []
  for (const feature of ranked) {
    const key = featureKey(feature)
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(feature)
    if (picked.length >= maxCount) break
  }
  return picked
}

export function selectAgentBuildingAtPlace(
  map: Map,
  lon: number,
  lat: number,
  maxDistanceM = 55,
): boolean {
  clearSelectedBuildings(map)
  const buildings = pickNearestBuildings(
    queryBuildingsNear(map, lon, lat, maxDistanceM),
    lon,
    lat,
    AGENT_BUILDING_SELECT_COUNT,
  )
  if (!buildings.length) return false
  for (const building of buildings) {
    map.setFeatureState(building, { select: true })
  }
  selectedBuildings = buildings
  return true
}
