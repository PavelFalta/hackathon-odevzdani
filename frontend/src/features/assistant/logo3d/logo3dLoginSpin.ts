const DRAG_SENS = 0.009
const FRICTION = 0.988

export type LoginSpinDrive = {
  readAngle: () => number
  tick: (dt: number) => void
}

export function attachLogoLoginSpin(
  canvas: HTMLCanvasElement,
): LoginSpinDrive & { dispose: () => void } {
  let userAngle = 0
  let userVelocity = 0
  let dragging = false
  let lastX = 0
  let lastT = 0

  const onDown = (e: PointerEvent) => {
    dragging = true
    lastX = e.clientX
    lastT = performance.now()
    canvas.setPointerCapture(e.pointerId)
    canvas.style.cursor = 'grabbing'
  }

  const onMove = (e: PointerEvent) => {
    if (!dragging) return
    const now = performance.now()
    const dt = Math.max((now - lastT) / 1000, 1 / 240)
    const dx = e.clientX - lastX
    lastX = e.clientX
    lastT = now
    userAngle += dx * DRAG_SENS
    userVelocity = (dx * DRAG_SENS) / dt
  }

  const endDrag = (e: PointerEvent) => {
    if (!dragging) return
    dragging = false
    canvas.releasePointerCapture(e.pointerId)
    canvas.style.cursor = 'grab'
  }

  canvas.style.cursor = 'grab'
  canvas.style.touchAction = 'none'
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', endDrag)
  canvas.addEventListener('pointercancel', endDrag)

  const drive: LoginSpinDrive = {
    readAngle: () => userAngle,
    tick: (dt: number) => {
      if (!dragging) {
        const decay = Math.pow(FRICTION, dt * 60)
        userVelocity *= decay
        userAngle += userVelocity * dt
      }
    },
  }

  return {
    ...drive,
    dispose: () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
    },
  }
}
