import type { LightPreset } from './basemapStyle'
import { WHEEL_LIGHT_PRESETS, WHEEL_PRESET_ANGLE } from './lightPresetWheel'

export const WHEEL_VIEW = { width: 280, height: 106 }

/** Upward semicircle sitting in the header tray. */
export const WHEEL_GEOMETRY = { cx: 140, cy: 82, radius: 44 }

/** Per-preset offsets keep icons outside the arc stroke and handle halo. */
export const WHEEL_MARKER_RADIUS_OFFSET: Record<LightPreset, number> = {
  dawn: 28,
  day: 26,
  dusk: 26,
  night: 32,
}

export function wheelPointAtAngle(
  cx: number,
  cy: number,
  radius: number,
  angle: number,
): { x: number; y: number } {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
}

export function wheelPointForPreset(
  preset: LightPreset,
  radiusOffset = 0,
): { x: number; y: number } {
  const { cx, cy, radius } = WHEEL_GEOMETRY
  return wheelPointAtAngle(cx, cy, radius + radiusOffset, WHEEL_PRESET_ANGLE[preset])
}

export function wheelPointOnArc(angle: number, radiusOffset = 0): { x: number; y: number } {
  const { cx, cy, radius } = WHEEL_GEOMETRY
  return wheelPointAtAngle(cx, cy, radius + radiusOffset, angle)
}

export function wheelPointForIndex(index: number): { x: number; y: number } {
  return wheelPointForPreset(WHEEL_LIGHT_PRESETS[index])
}

export function wheelArcPath(radiusOffset = 0): string {
  const { cx, cy, radius } = WHEEL_GEOMETRY
  const r = radius + radiusOffset
  const left = wheelPointAtAngle(cx, cy, r, -Math.PI)
  const right = wheelPointAtAngle(cx, cy, r, 0)
  return `M ${left.x} ${left.y} A ${r} ${r} 0 0 1 ${right.x} ${right.y}`
}
