import { MoonStar, Sunrise, Sun, Sunset } from 'lucide-react'
import type { LightPreset } from './basemapStyle'
import { WHEEL_LIGHT_PRESETS, WHEEL_PRESET_SHORT } from './lightPresetWheel'
import { WHEEL_MARKER_RADIUS_OFFSET, WHEEL_VIEW, wheelPointForPreset } from './mapTimeWheelLayout'

const MARKER_ICONS = {
  dawn: Sunrise,
  day: Sun,
  dusk: Sunset,
  night: MoonStar,
} as const

type MapTimeWheelMarkersProps = {
  activePreset: LightPreset
}

export function MapTimeWheelMarkers({ activePreset }: MapTimeWheelMarkersProps) {
  return (
    <div className="map-time-wheel__markers" aria-hidden>
      {WHEEL_LIGHT_PRESETS.map((id) => {
        const p = wheelPointForPreset(id, WHEEL_MARKER_RADIUS_OFFSET[id])
        const Icon = MARKER_ICONS[id]
        const active = id === activePreset
        return (
          <span
            key={id}
            className={active ? 'map-time-wheel__marker-btn active' : 'map-time-wheel__marker-btn'}
            style={{
              left: `${(p.x / WHEEL_VIEW.width) * 100}%`,
              top: `${(p.y / WHEEL_VIEW.height) * 100}%`,
            }}
            title={WHEEL_PRESET_SHORT[id]}
          >
            <Icon size={13} strokeWidth={1.75} aria-hidden />
          </span>
        )
      })}
    </div>
  )
}
