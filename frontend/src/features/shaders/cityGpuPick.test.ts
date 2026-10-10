import { describe, expect, it } from 'vitest'
import { clientToGlPixel, decodeCityPickColor } from './cityGpuPick'

describe('clientToGlPixel', () => {
  it('maps client coords to WebGL pixel indices', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    canvas.getBoundingClientRect = () => new DOMRect(0, 0, 400, 300) as DOMRect
    expect(clientToGlPixel(0, 0, canvas)).toEqual({ ix: 0, iy: 599 })
    expect(clientToGlPixel(200, 150, canvas)).toEqual({ ix: 400, iy: 300 })
  })
})

describe('decodeCityPickColor', () => {
  it('round-trips a negative row id', () => {
    const iz = -7
    const bits = iz + 65536
    const buf = new Uint8Array([3, bits & 255, (bits >> 8) & 255, 102])
    expect(decodeCityPickColor(buf)).toEqual({ ixm: 3, iz: -7, side: -1 })
  })

  it('treats a cleared pixel as a miss', () => {
    expect(decodeCityPickColor(new Uint8Array([0, 0, 0, 0]))).toBeNull()
  })
})
