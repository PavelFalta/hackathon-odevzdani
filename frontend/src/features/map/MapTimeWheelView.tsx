import { lightPresetFromLocalHour } from './lightPresetWheel'
import { MapTimeWheelClock } from './MapTimeWheelClock'
import { MapTimeWheelMarkers } from './MapTimeWheelMarkers'
import { WHEEL_VIEW, wheelArcPath, wheelPointOnArc } from './mapTimeWheelLayout'
import type { MapTimeWheelRevealPhase } from './mapTimeWheelTiming'
import { formatWheelClock, minutesFromWheelAngle } from './wheelTimeCycle'
import type { LightPreset } from './basemapStyle'

type MapTimeWheelViewProps = {
  angle: number
  phase: MapTimeWheelRevealPhase
  revealReady: boolean
  progress: number
  mapPreset: LightPreset
}

export function MapTimeWheelView({
  angle,
  phase,
  revealReady,
  progress,
  mapPreset,
}: MapTimeWheelViewProps) {
  const minutes = minutesFromWheelAngle(angle)
  const readout = formatWheelClock(minutes)
  const knob = wheelPointOnArc(angle)
  const activePreset = lightPresetFromLocalHour(Math.floor(minutes / 60) % 24)

  return (
    <div
      className="map-time-wheel kairos-floating-panel"
      data-preset={mapPreset}
      data-phase={phase}
      data-reveal-ready={revealReady ? 'true' : 'false'}
      data-progress={progress.toFixed(3)}
      role="group"
      aria-label="Čas na mapě"
    >
      <div className="map-time-wheel__shell">
        <svg
          className="map-time-wheel__svg"
          viewBox={`0 0 ${WHEEL_VIEW.width} ${WHEEL_VIEW.height}`}
          preserveAspectRatio="xMidYMax meet"
          aria-hidden
        >
          <path className="map-time-wheel__track-glow" d={wheelArcPath()} />
          <path className="map-time-wheel__track" d={wheelArcPath()} />
          <path
            className="map-time-wheel__track-progress"
            d={wheelArcPath(-7)}
            pathLength={1}
            style={{ strokeDashoffset: String(1 - progress) }}
          />
          <path className="map-time-wheel__track-inner" d={wheelArcPath(-7)} />
          <g className="map-time-wheel__handle" transform={`translate(${knob.x} ${knob.y})`}>
            <circle className="map-time-wheel__handle-halo" r={14} />
            <g className="map-time-wheel__handle-knob">
              <circle className="map-time-wheel__handle-ring" r={8} />
              <circle className="map-time-wheel__handle-core" r={3.5} />
            </g>
          </g>
        </svg>
        <MapTimeWheelMarkers activePreset={activePreset} />
      </div>
      <MapTimeWheelClock readout={readout} />
      <span className="map-time-wheel__sr" aria-live="polite">
        {readout}
      </span>
    </div>
  )
}
