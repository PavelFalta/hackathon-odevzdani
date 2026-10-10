import { useEffect, useRef } from 'react'
import { mountLoginAppLogoScene } from './mountLoginAppLogoScene'
import './login-app-logo.css'

type LoginAppLogo3dProps = {
  className?: string
  interactiveSpin?: boolean
}

export function LoginAppLogo3d({ className, interactiveSpin = true }: LoginAppLogo3dProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    return mountLoginAppLogoScene(canvas, { interactiveSpin })
  }, [interactiveSpin])

  return (
    <div className={className ?? 'login-app-logo'} aria-hidden="true">
      <canvas ref={canvasRef} className="login-app-logo__canvas" />
    </div>
  )
}
