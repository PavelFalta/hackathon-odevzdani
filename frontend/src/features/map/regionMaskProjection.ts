import type { Map } from 'mapbox-gl'

/** Globe renders Standard labels above unslotted custom layers; mercator lets clip layers sit above basemap symbols. */
export function applyRegionMaskProjection(map: Map) {
  map.setProjection('mercator')
}
