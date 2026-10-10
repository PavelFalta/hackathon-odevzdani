import { useEffect, useRef, type RefObject } from 'react'
import { mountLogo3dScene } from './logo3dSceneMount'
import type { Logo3dRuntime } from './logo3dRuntime'

export function useLogo3dScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  thinking: boolean,
  replyCue: number,
  staticPose = false,
  interactiveSpin = false,
) {
  const runtimeRef = useRef<Logo3dRuntime>({ thinking: false, replyCue: 0 })

  useEffect(() => {
    runtimeRef.current.thinking = thinking
    runtimeRef.current.replyCue = replyCue
  }, [thinking, replyCue])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return mountLogo3dScene(canvas, runtimeRef, staticPose, interactiveSpin)
  }, [canvasRef, staticPose, interactiveSpin])
}
