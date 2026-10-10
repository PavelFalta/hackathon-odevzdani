import { useRef } from 'react'
import { useLogo3dScene } from './useLogo3dScene'

type AssistantLogo3dProps = {
  thinking: boolean
  replyCue: number
  className?: string
  /** Render the GLB as authored (no circle/cube swap, no arrow cue). */
  staticPose?: boolean
  /** Login: drag to spin with momentum on top of the slow idle rotation. */
  interactiveSpin?: boolean
}

export function AssistantLogo3d({
  thinking,
  replyCue,
  className,
  staticPose = false,
  interactiveSpin = false,
}: AssistantLogo3dProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useLogo3dScene(canvasRef, thinking, replyCue, staticPose, interactiveSpin)

  return (
    <div className={className ?? 'assistant-logo3d assistant-logo3d--agent'} aria-hidden="true">
      <canvas ref={canvasRef} className="assistant-logo3d-canvas" />
    </div>
  )
}
