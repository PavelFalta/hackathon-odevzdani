import { useEffect } from 'react'
import { useMapControllerOptional } from '../map/MapContext'
import { applyKrajViewportLimits } from '../map/mapViewportLimits'
import { useMobileDockOptional } from './MobileDockContext'
import { useIsMobileShell } from './useIsMobileShell'

/** Keeps the fixed Mapbox host aligned with the visible map stage on mobile. */
export function ShellMapInsetBridge() {
  const mobile = useIsMobileShell()
  const dock = useMobileDockOptional()
  const dockOpen = Boolean(dock?.dockOpen)
  const mapCtx = useMapControllerOptional()

  useEffect(() => {
    const workspace = document.querySelector('.map-workspace--shell')
    const shell = document.querySelector('.shell')
    workspace?.classList.toggle('map-workspace--mobile-shell', mobile)
    workspace?.classList.toggle('map-workspace--mobile-dock', mobile && dockOpen)
    shell?.classList.toggle('shell--mobile-dock-open', mobile && dockOpen)

    const map = mapCtx?.map
    if (!map || mapCtx?.phase === 'loading') return
    const frame = window.requestAnimationFrame(() => {
      map.resize()
      applyKrajViewportLimits(map)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [mobile, dockOpen, mapCtx?.map, mapCtx?.phase])

  return null
}
