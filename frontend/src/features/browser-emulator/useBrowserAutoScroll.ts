import { useEffect, useRef, type RefObject } from 'react'
import { startIframeAutoScroll } from './iframeAutoScroll'

export function useBrowserAutoScroll(
  iframeRef: RefObject<HTMLIFrameElement | null>,
  enabled: boolean,
): void {
  const stopRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    stopRef.current?.()
    stopRef.current = null
    if (!enabled) return undefined
    const iframe = iframeRef.current
    if (!iframe) return undefined
    const start = () => {
      stopRef.current?.()
      stopRef.current = startIframeAutoScroll(iframe)
    }
    const frame = requestAnimationFrame(start)
    return () => {
      cancelAnimationFrame(frame)
      stopRef.current?.()
      stopRef.current = null
    }
  }, [enabled, iframeRef])
}
