import { useEffect, useRef, type RefObject } from 'react'

/** Shader discards pixels outside ~97.6% of the canvas diameter. */
const SURFACE_INSET_RATIO = 0.012

function surfaceNode(host: HTMLElement): HTMLElement | null {
  return host.querySelector<HTMLElement>('.assistant-talk-orb__visual [data-orb-ui-slot="surface"]')
}

export function useTalkOrbSurfaceLayout(hostRef: RefObject<HTMLElement | null>) {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0

    const tick = () => {
      const host = hostRef.current
      const layer = layerRef.current
      const wrap = layer?.offsetParent as HTMLElement | null
      const surface = host ? surfaceNode(host) : null

      if (!layer || !wrap || !surface) {
        raf = requestAnimationFrame(tick)
        return
      }

      const wrapRect = wrap.getBoundingClientRect()
      const rect = surface.getBoundingClientRect()
      const inset = rect.width * SURFACE_INSET_RATIO
      layer.style.left = `${rect.left - wrapRect.left + inset}px`
      layer.style.top = `${rect.top - wrapRect.top + inset}px`
      layer.style.width = `${Math.max(0, rect.width - inset * 2)}px`
      layer.style.height = `${Math.max(0, rect.height - inset * 2)}px`

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hostRef])

  return layerRef
}
