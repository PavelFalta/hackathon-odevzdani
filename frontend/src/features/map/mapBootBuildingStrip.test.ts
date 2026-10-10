import { describe, expect, it } from 'vitest'
import {
  buildingGrow,
  createBootBuildingStripState,
  spawnBuilding,
  tickBootBuildingStrip,
} from './mapBootBuildingStrip'

describe('buildingGrow', () => {
  it('starts at zero on the right and rises while scrolling left', () => {
    const b = spawnBuilding(0, 340)
    expect(buildingGrow(b, 320)).toBe(0)
    const mid = buildingGrow({ ...b, x: 290 }, 320)
    expect(mid).toBeGreaterThan(0.25)
    expect(mid).toBeLessThan(1)
    expect(buildingGrow({ ...b, x: 80 }, 320)).toBe(1)
  })
})

describe('tickBootBuildingStrip', () => {
  it('scrolls buildings left', () => {
    let state = createBootBuildingStripState()
    for (let i = 0; i < 5; i++) state = tickBootBuildingStrip(state, 0.05, 320)
    const anchor = state.buildings[0]
    for (let i = 0; i < 10; i++) state = tickBootBuildingStrip(state, 0.05, 320)
    const moved = state.buildings.find((b) => b.spawnX === anchor.spawnX)
    expect(moved).toBeDefined()
    expect(moved!.x).toBeLessThan(anchor.x)
  })

  it('spawns off the right edge', () => {
    let state = createBootBuildingStripState()
    for (let i = 0; i < 50; i++) {
      state = tickBootBuildingStrip(state, 0.1, 400)
    }
    const minX = state.buildings.reduce((m, b) => Math.min(m, b.x), Infinity)
    expect(minX).toBeLessThan(250)
    const maxX = state.buildings.reduce((m, b) => Math.max(m, b.x + b.width), 0)
    expect(maxX).toBeGreaterThan(380)
  })
})
