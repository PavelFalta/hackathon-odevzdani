import { afterEach, describe, expect, it, vi } from 'vitest'
import { startSlowAutoScroll } from './slowAutoScroll'

describe('startSlowAutoScroll', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls until the bottom when content overflows', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true })
    Object.defineProperty(el, 'scrollHeight', { value: 200, configurable: true })
    let scrollTop = 0
    Object.defineProperty(el, 'scrollTop', {
      get: () => scrollTop,
      set: (v: number) => {
        scrollTop = v
      },
      configurable: true,
    })

    let frames = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames += 1
      if (frames <= 300) cb(0)
      return frames
    })

    const stop = startSlowAutoScroll(el, { speed: 1 })
    expect(scrollTop).toBe(100)
    stop()
  })

  it('stops scrolling after pointerdown on a stop target', () => {
    const el = document.createElement('div')
    const panel = document.createElement('section')
    panel.appendChild(el)
    Object.defineProperty(el, 'clientHeight', { value: 100, configurable: true })
    Object.defineProperty(el, 'scrollHeight', { value: 10_000, configurable: true })
    let scrollTop = 0
    Object.defineProperty(el, 'scrollTop', {
      get: () => scrollTop,
      set: (v: number) => {
        scrollTop = v
      },
      configurable: true,
    })

    let frames = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames += 1
      if (frames === 3) {
        panel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      }
      if (frames <= 300) cb(0)
      return frames
    })

    startSlowAutoScroll(el, { speed: 1, stopOnPointerDown: [el, panel] })
    expect(scrollTop).toBe(2)
  })
})
