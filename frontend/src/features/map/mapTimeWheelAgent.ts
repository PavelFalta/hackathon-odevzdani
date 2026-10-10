import type { LightPreset } from './basemapStyle'
import { WHEEL_MARKER_MINUTES } from './lightPresetWheel'

export type MapTimeWheelAgent = {
  animateToMinutes: (minutes: number) => void
}

export const mapTimeWheelAgentRef: { current: Partial<MapTimeWheelAgent> } = { current: {} }

export function registerMapTimeWheelAgent(agent: MapTimeWheelAgent): () => void {
  mapTimeWheelAgentRef.current = agent
  return () => {
    mapTimeWheelAgentRef.current = {}
  }
}

export function requestMapTimeWheelAnimate(minutes: number): boolean {
  const animate = mapTimeWheelAgentRef.current.animateToMinutes
  if (!animate) return false
  animate(minutes)
  return true
}

export function wheelMinutesForLightPreset(preset: LightPreset): number {
  return WHEEL_MARKER_MINUTES[preset]
}

export type ParsedMapTime = { minutes: number; readout: string }

export function parseMapTimeArgs(
  args: { hour?: number; minute?: number; time?: string } | null,
): ParsedMapTime | { error: string } {
  if (!args) return { error: 'invalid_arguments' }

  if (args.time !== undefined) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(args.time.trim())
    if (!match) return { error: 'time_format' }
    const hour = Number(match[1])
    const minute = Number(match[2])
    if (!isValidClock(hour, minute)) return { error: 'time_out_of_range' }
    return toParsed(hour, minute)
  }

  if (args.hour === undefined) return { error: 'hour_or_time_required' }
  const hour = args.hour
  const minute = args.minute ?? 0
  if (!isValidClock(hour, minute)) return { error: 'time_out_of_range' }
  return toParsed(hour, minute)
}

function isValidClock(hour: number, minute: number): boolean {
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59
  )
}

function toParsed(hour: number, minute: number): ParsedMapTime {
  const minutes = hour * 60 + minute
  const readout = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  return { minutes, readout }
}
