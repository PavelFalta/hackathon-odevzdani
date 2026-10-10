import { describe, expect, it } from 'vitest'
import {
  OUTSIDE_SHADED_CLIP_LAYER,
  OUTSIDE_SHADED_CLIP_SCOPE,
  OUTSIDE_SHADED_CLIP_TYPES,
} from './regionMaskBasemapClip'

describe('regionMaskBasemapClip', () => {
  it('targets basemap symbols and 3d models in the shaded ring', () => {
    expect(OUTSIDE_SHADED_CLIP_LAYER).toBe('kvk-outside-shaded-clip')
    expect(OUTSIDE_SHADED_CLIP_TYPES).toEqual(['symbol', 'model'])
    expect(OUTSIDE_SHADED_CLIP_SCOPE).toEqual(['basemap'])
  })
})
