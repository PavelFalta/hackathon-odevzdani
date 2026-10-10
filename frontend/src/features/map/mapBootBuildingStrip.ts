export type BootBuilding = {
  x: number
  width: number
  height: number
  spawnX: number
}

export type BootBuildingStripState = {
  buildings: BootBuilding[]
  nextSeed: number
}

export function createBootBuildingStripState(): BootBuildingStripState {
  return { buildings: [], nextSeed: 0 }
}

const SCROLL_PX_PER_S = 68

export function pseudoRandom(seed: number): number {
  const p = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return p - Math.floor(p)
}

export function spawnBuilding(seed: number, x: number): BootBuilding {
  const width = 5 + pseudoRandom(seed) * 9
  const height = 8 + pseudoRandom(seed + 1) * 16
  return {
    x,
    width,
    height,
    spawnX: x,
  }
}

/** Rise completes while the block travels this far left from its spawn point. */
export function growTravelPx(panelW: number): number {
  return Math.max(28, Math.min(56, panelW * 0.55))
}

export function buildingGrow(b: BootBuilding, panelW: number): number {
  if (b.x >= panelW) return 0
  const intoView = panelW - b.x
  return Math.min(1, intoView / growTravelPx(panelW))
}

export function tickBootBuildingStrip(
  state: BootBuildingStripState,
  dt: number,
  panelW: number,
): BootBuildingStripState {
  if (panelW <= 0) return state

  const scroll = SCROLL_PX_PER_S * dt
  let buildings = state.buildings
    .map((b) => ({ ...b, x: b.x - scroll }))
    .filter((b) => b.x + b.width > -24)

  const rightEdge = buildings.reduce((max, b) => Math.max(max, b.x + b.width), -Infinity)
  const needSpawn = !Number.isFinite(rightEdge) || rightEdge < panelW + 40
  if (!needSpawn) {
    return { buildings, nextSeed: state.nextSeed }
  }

  const seed = state.nextSeed
  const gap = 12 + pseudoRandom(seed) * 24
  const x = Number.isFinite(rightEdge) ? rightEdge + gap : panelW + 10 + pseudoRandom(seed + 1) * 16
  return { buildings: [...buildings, spawnBuilding(seed, x)], nextSeed: seed + 4 }
}

export function drawBootBuildingStrip(
  ctx: CanvasRenderingContext2D,
  buildings: BootBuilding[],
  panelW: number,
  panelH: number,
) {
  const groundY = panelH - 4
  ctx.strokeStyle = 'rgb(255 255 255 / 0.22)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(panelW, groundY)
  ctx.stroke()

  for (const b of buildings) {
    drawBootBuilding(ctx, b, groundY, buildingGrow(b, panelW))
  }
}

function drawBootBuilding(
  ctx: CanvasRenderingContext2D,
  b: BootBuilding,
  groundY: number,
  grow: number,
) {
  const h = b.height * grow
  if (h < 1) return
  const y = groundY - h
  const alpha = 0.4 + 0.5 * grow
  ctx.strokeStyle = `rgb(255 255 255 / ${alpha.toFixed(3)})`
  ctx.lineWidth = 1
  ctx.strokeRect(b.x + 0.5, y + 0.5, b.width - 1, h - 1)
}
