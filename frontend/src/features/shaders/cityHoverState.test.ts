import { describe, expect, it } from 'vitest'
import { packCityHover, stepCityVoices, type HoverVoice } from './cityHoverState'

const a = { ixm: 2, side: 1, iz: 5 }
const b = { ixm: 4, side: -1, iz: -3 }

describe('stepCityVoices', () => {
  it('attacks quickly without jumping to full on the first frames', () => {
    const early = stepCityVoices([], a, 0.04)
    expect(early[0].glow).toBeGreaterThan(0.3)
    expect(early[0].glow).toBeLessThan(0.6)
    const risen = stepCityVoices(early, a, 0.16)
    expect(risen[0].glow).toBeGreaterThan(0.9)
  })

  it('keeps a released building glowing while the next one attacks', () => {
    let voices: HoverVoice[] = stepCityVoices([], a, 0.3)
    voices = stepCityVoices(voices, b, 0.04)
    const left = voices.find((v) => v.cell.iz === a.iz)
    const right = voices.find((v) => v.cell.iz === b.iz)
    expect(left?.glow).toBeGreaterThan(0.7)
    expect(right?.glow).toBeGreaterThan(0.3)
    expect(right?.glow).toBeLessThan(0.6)
    voices = stepCityVoices(voices, null, 1.2)
    expect(voices.every((v) => v.glow < 0.4)).toBe(true)
    voices = stepCityVoices(voices, null, 2.2)
    expect(voices).toEqual([])
  })

  it('packs silent slots as empty', () => {
    const cells = new Int32Array(18)
    const glows = new Float32Array(6)
    const voices = stepCityVoices([], a, 0.2)
    packCityHover(voices, cells, glows)
    expect(cells[0]).toBe(2)
    expect(cells[2]).toBe(5)
    expect(glows[0]).toBeGreaterThan(0)
    expect(glows[1]).toBe(0)
    expect(cells[3]).toBe(-999_999)
  })
})
