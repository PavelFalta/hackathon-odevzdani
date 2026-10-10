import { describe, expect, it } from 'vitest'
import { cityPickFrame } from './cityPick'

describe('cityPickFrame', () => {
  it('returns null outside the canvas', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    canvas.getBoundingClientRect = () => new DOMRect(0, 0, 400, 300) as DOMRect
    expect(cityPickFrame(-10, 150, canvas, 0)).toBeNull()
  })
})
