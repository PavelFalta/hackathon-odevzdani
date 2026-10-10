import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHEB_VIEW, PANORAMA_DURATION_MS, PANORAMA_START } from './region'

const preload = vi.fn(
  async (_map: unknown, _cancel: () => boolean, onStop?: (n: number) => void) => {
    onStop?.(1)
  },
)

vi.mock('./regionPreload', () => ({
  countPreloadViewpoints: () => 1,
  preloadKvkRegion: (...args: unknown[]) => preload(...args),
}))

vi.mock('./mapIdle', () => ({
  waitForMapIdle: vi.fn(async () => {}),
}))

vi.mock('./basemapStyle', () => ({
  DEFAULT_BASEMAP_STYLE: { lightPreset: 'day' },
  applyBasemapStyle: vi.fn(),
}))

vi.mock('./mapReveal', () => ({
  refreshMapGlAfterShow: vi.fn(),
}))

vi.mock('./mapTerrain', () => ({
  ensureTerrainSource: vi.fn(),
  applyFogForPreset: vi.fn(),
}))

vi.mock('./regionMask', () => ({
  installRegionMask: vi.fn(async () => {}),
}))

import { runMapBootSequence } from './mapBootSequence'

function fakeMap() {
  return { jumpTo: vi.fn(), flyTo: vi.fn() }
}

describe('runMapBootSequence', () => {
  beforeEach(() => {
    preload.mockClear()
  })

  it('flies the panorama after preload, even when tiles are already in', async () => {
    const map = fakeMap()
    const phases: string[] = []
    await runMapBootSequence(
      map as never,
      (phase) => phases.push(phase),
      () => false,
      () => {},
      () => true,
      { lightPreset: 'day' },
    )
    expect(preload).toHaveBeenCalled()
    expect(map.jumpTo).toHaveBeenCalledWith(PANORAMA_START)
    expect(map.flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: CHEB_VIEW.center,
        zoom: CHEB_VIEW.zoom,
        duration: PANORAMA_DURATION_MS,
      }),
    )
    expect(preload.mock.invocationCallOrder[0]).toBeLessThan(map.flyTo.mock.invocationCallOrder[0])
    expect(phases).toEqual(['loading', 'panorama'])
  })

  it('holds the panorama until the shell is on screen', async () => {
    const map = fakeMap()
    let present = false
    const done = runMapBootSequence(
      map as never,
      () => {},
      () => false,
      () => {},
      () => present,
      { lightPreset: 'day' },
    )
    await vi.waitFor(() => expect(preload).toHaveBeenCalled())
    expect(map.flyTo).not.toHaveBeenCalled()
    present = true
    await done
    expect(map.jumpTo).toHaveBeenCalledWith(PANORAMA_START)
    expect(map.flyTo).toHaveBeenCalled()
  })
})
