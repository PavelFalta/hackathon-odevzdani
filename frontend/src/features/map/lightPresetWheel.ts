import { DEFAULT_BASEMAP_STYLE, type BasemapStyleState, type LightPreset } from './basemapStyle'

/** Morning → noon → evening → night along the top arc. */
export const WHEEL_LIGHT_PRESETS: LightPreset[] = ['dawn', 'day', 'dusk', 'night']

/** θ from −π (left) → 0 (right) along the top arc. */
/** Left base, apex, mid-right curve, right base. */
export const WHEEL_PRESET_ANGLE: Record<LightPreset, number> = {
  dawn: -Math.PI,
  day: -Math.PI / 2,
  dusk: -Math.PI / 3.4,
  night: -0.08,
}

export const WHEEL_PRESET_SHORT: Record<LightPreset, string> = {
  dawn: 'Ráno',
  day: 'Poledne',
  dusk: 'Večer',
  night: 'Noc',
}

/** Default clock positions for preset markers and agent jumps. */
export const WHEEL_MARKER_MINUTES: Record<LightPreset, number> = {
  dawn: 6 * 60,
  day: 12 * 60,
  dusk: 18 * 60,
  night: 24 * 60,
}

const STAGE_COUNT = WHEEL_LIGHT_PRESETS.length

export function wheelIndexForPreset(preset: LightPreset): number {
  const i = WHEEL_LIGHT_PRESETS.indexOf(preset)
  return i >= 0 ? i : 1
}

export function presetAtWheelIndex(index: number): LightPreset {
  const clamped = Math.max(0, Math.min(STAGE_COUNT - 1, Math.round(index)))
  return WHEEL_LIGHT_PRESETS[clamped]
}

export function wheelAngleForIndex(index: number): number {
  return WHEEL_PRESET_ANGLE[WHEEL_LIGHT_PRESETS[index]]
}

/** Pointer angle in [−π, 0] on the top semicircle; null if outside arc. */
export function pointerSemicircleAngle(
  cx: number,
  cy: number,
  px: number,
  py: number,
): number | null {
  const a = Math.atan2(py - cy, px - cx)
  if (a > 0.2 || a < -Math.PI - 0.2) return null
  return Math.max(-Math.PI, Math.min(0, a))
}

export function snapWheelIndexFromAngle(angle: number): number {
  const clamped = Math.max(-Math.PI, Math.min(0, angle))
  let best = 0
  let bestDist = Infinity
  WHEEL_LIGHT_PRESETS.forEach((preset, i) => {
    const d = Math.abs(clamped - WHEEL_PRESET_ANGLE[preset])
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

/** Map local clock hour (0–23) to the nearest lighting stage. */
export function lightPresetFromLocalHour(hour: number): LightPreset {
  if (hour >= 5 && hour < 8) return 'dawn'
  if (hour >= 8 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}

export function initialBasemapStyle(at = new Date()): BasemapStyleState {
  return {
    ...DEFAULT_BASEMAP_STYLE,
    lightPreset: lightPresetFromLocalHour(at.getHours()),
  }
}
