import type { CityCell } from './cityPick'

/** Fast attack, long release — a key press, not a light switch. */
const ATTACK = 0.07
const RELEASE = 0.85
const SILENT = 0.02
export const HOVER_SLOTS = 6
const EMPTY = -999_999

export type HoverVoice = { cell: CityCell; glow: number }

function sameCell(a: CityCell, b: CityCell) {
  return a.ixm === b.ixm && a.side === b.side && a.iz === b.iz
}

function approach(glow: number, dt: number) {
  return 1 - (1 - glow) * Math.exp(-dt / ATTACK)
}

export function stepCityVoices(
  voices: HoverVoice[],
  under: CityCell | null,
  dt: number,
): HoverVoice[] {
  const next: HoverVoice[] = []
  let held = false
  for (const voice of voices) {
    const on = Boolean(under && sameCell(voice.cell, under))
    if (on) held = true
    const glow = on ? approach(voice.glow, dt) : voice.glow * Math.exp(-dt / RELEASE)
    if (glow > SILENT) next.push({ cell: voice.cell, glow })
  }
  if (!under || held) return next
  const born = { cell: under, glow: approach(0, dt) }
  if (next.length < HOVER_SLOTS) return [...next, born]
  let quiet = 0
  for (let i = 1; i < next.length; i++) {
    if (next[i].glow < next[quiet].glow) quiet = i
  }
  next[quiet] = born
  return next
}

export function packCityHover(voices: HoverVoice[], cells: Int32Array, glows: Float32Array) {
  cells.fill(EMPTY)
  glows.fill(0)
  const n = Math.min(voices.length, HOVER_SLOTS)
  for (let i = 0; i < n; i++) {
    cells[i * 3] = voices[i].cell.ixm
    cells[i * 3 + 1] = voices[i].cell.side
    cells[i * 3 + 2] = voices[i].cell.iz
    glows[i] = voices[i].glow
  }
}
