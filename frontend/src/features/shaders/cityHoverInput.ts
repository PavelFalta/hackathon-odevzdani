export type CityHoverInput = {
  bind: (canvas: HTMLCanvasElement) => void
  unbind: () => void
  pointer: () => { x: number; y: number } | null
}

export function createCityHoverInput(): CityHoverInput {
  let canvas: HTMLCanvasElement | null = null
  let pointerX = -1
  let pointerY = -1

  const onPointerMove = (e: PointerEvent) => {
    pointerX = e.clientX
    pointerY = e.clientY
  }

  const onPointerLeave = () => {
    pointerX = -1
    pointerY = -1
  }

  return {
    bind(nextCanvas) {
      canvas = nextCanvas
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave)
    },
    unbind() {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      pointerX = -1
      pointerY = -1
      canvas = null
    },
    pointer: () => {
      if (!canvas || pointerX < 0) return null
      return { x: pointerX, y: pointerY }
    },
  }
}
