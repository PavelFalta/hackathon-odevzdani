import { lightPresetFromLocalHour } from './lightPresetWheel'
import {
  WHEEL_FADE_IN_MS,
  WHEEL_FADE_OUT_MS,
  WHEEL_HOLD_MS,
  wheelAnimationDurationMs,
} from './mapTimeWheelTiming'
import type { BasemapStyleState } from './basemapStyle'
import { animateWheelMinutes } from './wheelTimeAnimate'
import { minutesFromWheelAngle, wheelAngleFromMinutes } from './wheelTimeCycle'

export type MapTimeWheelSessionCallbacks = {
  setAngle: (angle: number) => void
  setPhase: (phase: 'enter' | 'run' | 'hold' | 'exit' | 'idle') => void
  setRevealReady: (ready: boolean) => void
  setProgress: (progress: number) => void
}

export function createMapTimeWheelAgentSession(
  setStyle: (patch: Partial<BasemapStyleState>) => void,
  callbacks: MapTimeWheelSessionCallbacks,
  angleRef: { current: number },
) {
  const lastPresetRef = { current: null as string | null }
  let animation: ReturnType<typeof animateWheelMinutes> | null = null
  const timers: number[] = []

  const clearTimers = () => {
    for (const id of timers) window.clearTimeout(id)
    timers.length = 0
  }

  const schedule = (fn: () => void, ms: number) => {
    timers.push(window.setTimeout(fn, ms))
  }

  const applyMinutes = (minutes: number) => {
    callbacks.setAngle(wheelAngleFromMinutes(minutes))
    const preset = lightPresetFromLocalHour(Math.floor(minutes / 60) % 24)
    if (lastPresetRef.current !== preset) {
      lastPresetRef.current = preset
      setStyle({ lightPreset: preset })
    }
  }

  const finishRun = () => {
    animation = null
    callbacks.setProgress(1)
    callbacks.setPhase('hold')
    schedule(() => {
      callbacks.setPhase('exit')
      schedule(() => callbacks.setPhase('idle'), WHEEL_FADE_OUT_MS)
    }, WHEEL_HOLD_MS)
  }

  const startRun = (targetMinutes: number) => {
    animation?.cancel()
    const fromMinutes = minutesFromWheelAngle(angleRef.current)
    const durationMs = wheelAnimationDurationMs(fromMinutes, targetMinutes)
    lastPresetRef.current = null
    callbacks.setProgress(0)
    callbacks.setPhase('run')
    animation = animateWheelMinutes(
      fromMinutes,
      targetMinutes,
      durationMs,
      (minutes, t) => {
        applyMinutes(minutes)
        callbacks.setProgress(t)
      },
      finishRun,
    )
  }

  return {
    beginSequence(targetMinutes: number) {
      clearTimers()
      animation?.cancel()
      callbacks.setRevealReady(false)
      callbacks.setPhase('enter')
      schedule(() => startRun(targetMinutes), WHEEL_FADE_IN_MS)
    },
    dispose() {
      clearTimers()
      animation?.cancel()
    },
  }
}
