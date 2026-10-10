import { useKairosWordmarkWave } from './useKairosWordmarkWave'
import './kairosWordmark.css'

type KairosWordmarkProps = {
  className?: string
}

export function KairosWordmark({ className }: KairosWordmarkProps) {
  const waving = useKairosWordmarkWave()
  const rootClass = ['kairos-wordmark', className ?? ''].filter(Boolean).join(' ')
  const aiWave = waving ? ' kairos-wordmark__ai--wave' : ''

  return (
    <h1 className={rootClass} aria-label="KAIROS">
      K<span className={`kairos-wordmark__ai kairos-wordmark__ai--a${aiWave}`}>A</span>
      <span className={`kairos-wordmark__ai kairos-wordmark__ai--i${aiWave}`}>I</span>
      ROS
    </h1>
  )
}
