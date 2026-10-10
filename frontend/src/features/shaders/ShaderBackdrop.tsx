import { useRef } from 'react'
import { useKairosGl } from './useKairosGl'
import './shader-backdrop.css'

type ShaderBackdropProps = {
  className?: string
  buildingHover?: boolean
  ambient?: boolean
}

export function ShaderBackdrop({ className, buildingHover, ambient }: ShaderBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useKairosGl(canvasRef, { buildingHover, ambient })

  return (
    <div className={className ?? 'shader-backdrop'} aria-hidden="true">
      <canvas ref={canvasRef} className="shader-canvas" />
      <div className="shader-vignette" />
      <div className="shader-scanlines" />
    </div>
  )
}
