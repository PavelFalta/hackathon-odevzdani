import { useEffect, useRef, type RefObject } from 'react'
import { startSlowAutoScroll } from '../browser-emulator/slowAutoScroll'

export function useReviewsAutoScroll(
  scrollRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    stopRef.current?.()
    stopRef.current = null
    if (!enabled) return undefined
    const el = scrollRef.current
    if (!el) return undefined
    const start = () => {
      stopRef.current?.()
      const panel = el.closest('.reviews-panel')
      const stopOnPointerDown = panel ? [el, panel] : [el]
      stopRef.current = startSlowAutoScroll(el, { stopOnPointerDown })
    }
    const frame = requestAnimationFrame(start)
    return () => {
      cancelAnimationFrame(frame)
      stopRef.current?.()
      stopRef.current = null
    }
  }, [enabled, scrollRef])
}
