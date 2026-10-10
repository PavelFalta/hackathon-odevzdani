import { useEffect, useRef } from 'react'
import {
  createBootBuildingStripState,
  drawBootBuildingStrip,
  tickBootBuildingStrip,
  type BootBuildingStripState,
} from './mapBootBuildingStrip'

export function MapBootBuildingStrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<BootBuildingStripState>(createBootBuildingStripState())

  useEffect(() => {
    const canvas = canvasRef.current
    const panel = panelRef.current
    if (!canvas || !panel) return

    let frame = 0
    let last = performance.now()

    const tick = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const w = panel.clientWidth
      const h = panel.clientHeight
      if (w > 0 && h > 0) {
        const dpr = Math.min(window.devicePixelRatio, 2)
        const cw = Math.floor(w * dpr)
        const ch = Math.floor(h * dpr)
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw
          canvas.height = ch
        }
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          stateRef.current = tickBootBuildingStrip(stateRef.current, dt, w)
          ctx.clearRect(0, 0, w, h)
          drawBootBuildingStrip(ctx, stateRef.current.buildings, w, h)
        }
      }

      frame = requestAnimationFrame(tick)
    }

    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div ref={panelRef} className="map-boot-strip" data-testid="map-boot-building-strip">
      <canvas ref={canvasRef} className="map-boot-strip-canvas" />
    </div>
  )
}
