import type { FogSpecification, Map } from 'mapbox-gl'
import type { LightPreset } from './basemapStyle'

const FOG: Record<LightPreset, FogSpecification> = {
  day: {
    color: 'rgb(186, 210, 235)',
    'high-color': 'rgb(120, 160, 200)',
    'horizon-blend': 0.12,
    'space-color': 'rgb(80, 120, 180)',
    'star-intensity': 0,
  },
  dawn: {
    color: 'rgb(255, 184, 140)',
    'high-color': 'rgb(200, 140, 120)',
    'horizon-blend': 0.14,
    'space-color': 'rgb(40, 50, 80)',
    'star-intensity': 0.1,
  },
  dusk: {
    color: 'rgb(80, 60, 100)',
    'high-color': 'rgb(120, 80, 100)',
    'horizon-blend': 0.1,
    'space-color': 'rgb(20, 15, 35)',
    'star-intensity': 0.25,
  },
  night: {
    color: 'rgb(2, 12, 24)',
    'high-color': 'rgb(8, 40, 64)',
    'horizon-blend': 0.08,
    'space-color': 'rgb(2, 6, 16)',
    'star-intensity': 0.35,
  },
}

export function ensureTerrainSource(map: Map) {
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    })
  }
}

export function applyFogForPreset(map: Map, preset: LightPreset) {
  map.setFog(FOG[preset])
}
