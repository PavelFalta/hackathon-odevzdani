import { useMapControllerOptional } from './MapContext'
import { MapTimeWheelView } from './MapTimeWheelView'
import { useMapTimeWheelAgentSync } from './useMapTimeWheelAgentSync'
import './map-time-wheel.css'

export function MapTimeWheel() {
  const map = useMapControllerOptional()
  const { angle, phase, revealReady, progress, visible } = useMapTimeWheelAgentSync({
    setStyle: map?.setStyle ?? (() => {}),
  })

  if (!map || map.phase !== 'ready' || !visible) return null

  return (
    <MapTimeWheelView
      angle={angle}
      phase={phase}
      revealReady={revealReady}
      progress={progress}
      mapPreset={map.style.lightPreset}
    />
  )
}
