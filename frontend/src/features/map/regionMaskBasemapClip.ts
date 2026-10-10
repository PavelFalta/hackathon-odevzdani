import type { Map } from 'mapbox-gl'
import { KVK_MASK_FILL_LAYER } from './regionMaskIds'

export const OUTSIDE_SHADED_CLIP_LAYER = 'kvk-outside-shaded-clip'
export const KVK_REGION_MASK_SOURCE = 'kvk-region-mask'

export const OUTSIDE_SHADED_CLIP_TYPES: Array<'symbol' | 'model'> = ['symbol', 'model']
export const OUTSIDE_SHADED_CLIP_SCOPE = ['basemap']

const REMOVED_CLIP_LAYER_IDS = [
  'kvk-outside-shaded-clip',
  'kvk-outside-shaded-clip-middle',
  'kvk-outside-shaded-clip-top',
]

function removeStaleClipLayers(map: Map) {
  for (const id of REMOVED_CLIP_LAYER_IDS) {
    if (map.getLayer(id)) map.removeLayer(id)
  }
}

export function ensureOutsideShadedBasemapClip(map: Map) {
  if (!map.getSource(KVK_REGION_MASK_SOURCE)) return

  removeStaleClipLayers(map)

  const beforeId = map.getLayer(KVK_MASK_FILL_LAYER) ? KVK_MASK_FILL_LAYER : undefined
  map.addLayer(
    {
      id: OUTSIDE_SHADED_CLIP_LAYER,
      type: 'clip',
      source: KVK_REGION_MASK_SOURCE,
      layout: {
        'clip-layer-types': OUTSIDE_SHADED_CLIP_TYPES,
        'clip-layer-scope': OUTSIDE_SHADED_CLIP_SCOPE,
      },
    },
    beforeId,
  )
}
