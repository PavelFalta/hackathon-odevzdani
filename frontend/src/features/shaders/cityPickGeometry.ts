const C_HORIZON = 0.22
const C_DEPTH = 0.12
const C_SCROLL = 0.35

function fract(x: number): number {
  return x - Math.floor(x)
}

export function cellHash(c: readonly [number, number], k: number): number {
  let p0 = fract((c[0] + k * 37.1) * 0.1031)
  let p1 = fract((c[1] + k * 11.7) * 0.1031)
  let p2 = fract(k * 0.1031)
  const dot = p0 * (p1 + 33.33) + p1 * (p2 + 33.33) + p2 * (p0 + 33.33)
  const x = p0 + dot
  const y = p1 + dot
  const z = p2 + dot
  return fract((x + y) * z)
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function hair(g: number): number {
  return 1 - smoothstep(0.4, 1.2, g) + 0.22 * Math.exp(-g * 0.9)
}

type Block = {
  a: [number, number]
  b: [number, number]
  d: [number, number]
  a2: [number, number]
  b2: [number, number]
  c2: [number, number]
  d2: [number, number]
}

function makeBlock(ixm: number, side: number, iz: number, time: number): Block {
  const cell: [number, number] = [side > 0 ? ixm : -1 - ixm, iz]
  const dep = mix(0.35, 0.8, cellHash(cell, 4))
  const w = mix(0.3, 0.75, cellHash(cell, 1))
  const x0 = ixm + 0.5 - 0.5 * w
  const x1 = x0 + w
  const zn = (iz + 0.5 - 0.5 * dep + time * C_SCROLL) * 0.25
  const zf = zn + dep * 0.25
  const hr = cellHash(cell, 2)
  const tall = hr >= 0.86 ? 1 : 0
  const hgt = tall ? mix(0.2, 0.5, (hr - 0.86) / 0.14) : mix(0.03, 0.09, hr / 0.86)
  const grow = smoothstep(0, 3, 4 * zn - (4 * C_DEPTH) / C_HORIZON)
  const yn = C_HORIZON - C_DEPTH / zn
  const yf = C_HORIZON - C_DEPTH / zf
  const lift = (hgt * grow) / zn
  const liftF = (hgt * grow) / zf
  return {
    a: [x0 / (8 * zn), yn],
    b: [x1 / (8 * zn), yn],
    d: [x0 / (8 * zf), yf],
    a2: [x0 / (8 * zn), yn + lift],
    b2: [x1 / (8 * zn), yn + lift],
    c2: [x1 / (8 * zf), yf + liftF],
    d2: [x0 / (8 * zf), yf + liftF],
  }
}

function side2(a: [number, number], b: [number, number], p: [number, number]): number {
  return (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])
}

function inQuad(
  p: [number, number],
  a: [number, number],
  b: [number, number],
  c: [number, number],
  d: [number, number],
): number {
  const s0 = side2(a, b, p)
  const s1 = side2(b, c, p)
  const s2 = side2(c, d, p)
  const s3 = side2(d, a, p)
  const lo = Math.min(s0, s1, s2, s3)
  const hi = Math.max(s0, s1, s2, s3)
  return lo >= 0 || hi <= 0 ? 1 : 0
}

function segPx(p: [number, number], a: [number, number], b: [number, number], pix: number): number {
  const pa = [p[0] - a[0], p[1] - a[1]] as [number, number]
  const ba = [b[0] - a[0], b[1] - a[1]] as [number, number]
  const denom = ba[0] * ba[0] + ba[1] * ba[1] + 1e-9
  const h = Math.min(1, Math.max(0, (pa[0] * ba[0] + pa[1] * ba[1]) / denom))
  const dx = pa[0] - ba[0] * h
  const dy = pa[1] - ba[1] * h
  return Math.hypot(dx, dy) / pix
}

/** Same visibility test as the city fragment shader (`blockAt` + discard). */
export function blockVisibleAt(
  p: [number, number],
  ixm: number,
  side: number,
  iz: number,
  pix: number,
  time: number,
): boolean {
  const cell: [number, number] = [side > 0 ? ixm : -1 - ixm, iz]
  if (cellHash(cell, 0) > 0.4) return false

  const k = makeBlock(ixm, side, iz, time)
  const roofUp = k.a2[1] <= k.d2[1] ? 1 : 0
  let face = inQuad(p, k.a, k.b, k.b2, k.a2)
  face = Math.max(face, inQuad(p, k.a, k.d, k.d2, k.a2))
  face = Math.max(face, inQuad(p, k.a2, k.b2, k.c2, k.d2) * roofUp)

  let e = segPx(p, k.a, k.b, pix)
  e = Math.min(e, segPx(p, k.a, k.a2, pix))
  e = Math.min(e, segPx(p, k.b, k.b2, pix))
  e = Math.min(e, segPx(p, k.a2, k.b2, pix))
  e = Math.min(e, segPx(p, k.a, k.d, pix))
  e = Math.min(e, segPx(p, k.d, k.d2, pix))
  e = Math.min(e, segPx(p, k.a2, k.d2, pix))
  e = Math.min(
    e,
    roofUp > 0.5 ? Math.min(segPx(p, k.b2, k.c2, pix), segPx(p, k.c2, k.d2, pix)) : 1e3,
  )

  const edge = hair(e)
  return Math.max(face, edge > 0.05 ? 1 : 0) > 0.5
}

export const CITY_PICK_SCROLL = C_SCROLL
export const CITY_PICK_DEPTH = C_DEPTH
export const CITY_PICK_HORIZON = C_HORIZON
