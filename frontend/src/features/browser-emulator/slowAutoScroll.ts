const pointerStopOpts = { capture: true, passive: true }

/** Slow cinematic scroll for a scrollable panel body. */
export function startSlowAutoScroll(
  scrollEl: HTMLElement,
  options?: { speed?: number; stopOnPointerDown?: EventTarget[] },
): () => void {
  let frame = 0
  let y = 0
  let idleFrames = 0
  let stopped = false
  const speed = options?.speed ?? 0.4
  const maxIdleFrames = 180
  const stopTargets = options?.stopOnPointerDown ?? []

  const stop = () => {
    if (stopped) return
    stopped = true
    cancelAnimationFrame(frame)
    for (const target of stopTargets) {
      target.removeEventListener('pointerdown', onPointerDown, pointerStopOpts)
    }
  }

  const onPointerDown = () => {
    stop()
  }

  for (const target of stopTargets) {
    target.addEventListener('pointerdown', onPointerDown, pointerStopOpts)
  }

  const tick = () => {
    if (stopped) return
    const max = scrollEl.scrollHeight - scrollEl.clientHeight
    if (max <= 0) {
      idleFrames += 1
      if (idleFrames < maxIdleFrames) frame = requestAnimationFrame(tick)
      return
    }
    idleFrames = 0
    y = Math.min(y + speed, max)
    scrollEl.scrollTop = y
    if (y < max) frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
  return stop
}
