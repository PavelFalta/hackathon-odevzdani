import { useEffect, useRef, useState } from 'react'
import { registerMapTimeWheelAgent } from './mapTimeWheelAgent'
import { createMapTimeWheelAgentSession } from './mapTimeWheelAgentSession'
import type { MapTimeWheelRevealPhase } from './mapTimeWheelTiming'
import type { BasemapStyleState } from './basemapStyle'
import { localDayMinutes, wheelAngleFromMinutes } from './wheelTimeCycle'

type SyncArgs = {
  setStyle: (patch: Partial<BasemapStyleState>) => void
}

export function useMapTimeWheelAgentSync({ setStyle }: SyncArgs) {
  const [angle, setAngle] = useState(() => wheelAngleFromMinutes(localDayMinutes()))
  const [phase, setPhase] = useState<MapTimeWheelRevealPhase>('idle')
  const [revealReady, setRevealReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const angleRef = useRef(angle)

  useEffect(() => {
    angleRef.current = angle
  }, [angle])

  useEffect(() => {
    const session = createMapTimeWheelAgentSession(
      setStyle,
      { setAngle, setPhase, setRevealReady, setProgress },
      angleRef,
    )
    const unregister = registerMapTimeWheelAgent({
      animateToMinutes: session.beginSequence,
    })
    return () => {
      unregister()
      session.dispose()
    }
  }, [setStyle])

  useEffect(() => {
    if (phase !== 'enter') {
      setRevealReady(false)
      return
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealReady(true))
    })
    return () => cancelAnimationFrame(id)
  }, [phase])

  return { angle, phase, revealReady, progress, visible: phase !== 'idle' }
}
