import {
  blockVisibleAt,
  CITY_PICK_DEPTH,
  CITY_PICK_HORIZON,
  CITY_PICK_SCROLL,
} from './cityPickGeometry'

export const CITY_ROWS = 28

export type CityCell = { ixm: number; side: number; iz: number }

export function cityColumnCount(width: number, height: number): number {
  const w = Math.max(width, 1)
  const h = Math.max(height, 1)
  return Math.ceil(30 * (w / h)) + 2
}

export type CityPickFrame = {
  aspect: number
  cols: number
  pix: number
  i0: number
  p: [number, number]
  mouseSide: number
}

export function cityPickFrame(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  time: number,
): CityPickFrame | null {
  const rect = canvas.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    return null
  }

  const w = canvas.width
  const h = canvas.height
  const aspect = w / h
  const uvX = (clientX - rect.left) / rect.width
  const uvY = 1 - (clientY - rect.top) / rect.height
  const px = (uvX - 0.5) * aspect
  const mouseSide = px < 0 ? -1 : 1
  const scroll = time * CITY_PICK_SCROLL
  const i0 = Math.ceil((4 * CITY_PICK_DEPTH) / CITY_PICK_HORIZON - 0.325 - scroll)

  return {
    aspect,
    cols: cityColumnCount(w, h),
    pix: 1 / h,
    i0,
    p: [Math.abs(px), uvY],
    mouseSide,
  }
}

export function pickCityBuildingFrame(frame: CityPickFrame, time: number): CityCell | null {
  const { cols, i0, p, pix, mouseSide } = frame
  const instances = CITY_ROWS * cols * 2

  for (let id = 0; id < instances; id += 1) {
    const side = (id & 1) === 0 ? 1 : -1
    if (side !== mouseSide) continue
    const cellIdx = id >> 1
    const row = Math.floor(cellIdx / cols)
    if (row >= CITY_ROWS) break
    const ixm = cellIdx % cols
    const iz = i0 + row
    if (blockVisibleAt(p, ixm, side, iz, pix, time)) {
      return { ixm, side, iz }
    }
  }
  return null
}

export function pickCityBuilding(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  time: number,
): CityCell | null {
  const frame = cityPickFrame(clientX, clientY, canvas, time)
  if (!frame) return null
  return pickCityBuildingFrame(frame, time)
}
