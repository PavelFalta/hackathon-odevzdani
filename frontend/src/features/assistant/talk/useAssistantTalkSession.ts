import type { OrbAdapter, OrbSignal, OrbState } from 'orb-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { connectRealtimeVoiceSession } from '../realtime/connectRealtimeVoice'
import type { RealtimeVoiceConnection } from '../realtime/connectRealtimeVoice'
import { processVoiceServerMessage } from './processVoiceServerMessage'
import {
  initialTalkOrbSignal,
  mergeTalkOrbSignal,
  normalizeInputLevel,
  normalizeOutputLevel,
} from './talkOrbSignal'
import { useTalkToolActivity } from './useTalkToolActivity'
import { initialVoiceOrbContext } from './voiceOrbState'
import { playVoiceActivationClick } from './voiceActivationClick'

export function useAssistantTalkSession(enabled: boolean): {
  adapter: OrbAdapter
  errorMessage: string | null
  toolActivity: string | null
  toolActive: boolean
  voiceTurnId: number
} {
  const connectionRef = useRef<RealtimeVoiceConnection | null>(null)
  const startingRef = useRef(false)
  const startGenerationRef = useRef(0)
  const orbContextRef = useRef(initialVoiceOrbContext())
  const greetingSentRef = useRef(false)
  const conversationIdRef = useRef<string | null>(null)
  const turnActivitiesRef = useRef<string[]>([])
  const turnToolNamesRef = useRef<string[]>([])
  const signalRef = useRef<OrbSignal>(initialTalkOrbSignal())
  const listenersRef = useRef(new Set<(signal: OrbSignal) => void>())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toolActivity, toolActive, onToolActivity, clearToolActivity } = useTalkToolActivity()
  const [voiceTurnId, setVoiceTurnId] = useState(0)

  const emitSignal = useCallback((patch: Partial<OrbSignal> & { state?: OrbState }) => {
    const next = mergeTalkOrbSignal(signalRef.current, patch)
    signalRef.current = next
    listenersRef.current.forEach((listener) => listener(next))
  }, [])

  const stop = useCallback(async () => {
    startGenerationRef.current += 1
    startingRef.current = false
    connectionRef.current?.close()
    connectionRef.current = null
    orbContextRef.current = initialVoiceOrbContext()
    greetingSentRef.current = false
    setErrorMessage(null)
    clearToolActivity()
    emitSignal({ state: 'idle', inputVolume: 0, outputVolume: 0 })
  }, [clearToolActivity, emitSignal])

  const start = useCallback(async () => {
    if (connectionRef.current || startingRef.current) return
    startingRef.current = true
    const generation = startGenerationRef.current + 1
    startGenerationRef.current = generation
    emitSignal({ state: 'connecting', inputVolume: 0, outputVolume: 0 })
    setErrorMessage(null)
    orbContextRef.current = initialVoiceOrbContext()
    greetingSentRef.current = false
    try {
      const conn = await connectRealtimeVoiceSession({
        onChannelOpen: () => {
          if (startGenerationRef.current !== generation) return
          playVoiceActivationClick()
          emitSignal({ state: 'listening' })
        },
        onInputLevel: (rms) => {
          if (startGenerationRef.current !== generation) return
          emitSignal({ inputVolume: normalizeInputLevel(rms) })
        },
        onOutputLevel: (rms) => {
          if (startGenerationRef.current !== generation) return
          emitSignal({ outputVolume: normalizeOutputLevel(rms) })
        },
        onMessage: (raw, channel) => {
          if (startGenerationRef.current !== generation) return
          void processVoiceServerMessage(raw, {
            channel,
            orbContextRef,
            greetingSentRef,
            setState: (state) => emitSignal({ state }),
            getState: () => signalRef.current.state ?? 'idle',
            setError: (message) => {
              setErrorMessage(message)
              emitSignal({ state: 'error' })
            },
            onToolActivity: (label) => {
              onToolActivity(label)
              emitSignal({ state: 'thinking' })
            },
            clearToolActivity,
            onUserTurnStart: () => {
              turnActivitiesRef.current = []
              turnToolNamesRef.current = []
              setVoiceTurnId((turn) => turn + 1)
            },
            conversationIdRef,
            turnActivitiesRef,
            turnToolNamesRef,
          })
        },
      })
      if (startGenerationRef.current !== generation) {
        conn.close()
        return
      }
      connectionRef.current = conn
      conversationIdRef.current = conn.conversationId
    } catch (cause) {
      if (startGenerationRef.current !== generation) return
      const message =
        cause instanceof Error ? cause.message : 'Nepodařilo se spustit hlasovou relaci.'
      setErrorMessage(message)
      emitSignal({ state: 'error' })
      await stop()
    } finally {
      if (startGenerationRef.current === generation) startingRef.current = false
    }
  }, [clearToolActivity, emitSignal, onToolActivity, stop])

  useEffect(() => {
    if (!enabled) {
      void stop()
      return () => {
        void stop()
      }
    }
    void start()
    return () => {
      void stop()
    }
  }, [enabled, start, stop])

  const adapter = useMemo<OrbAdapter>(
    () => ({
      subscribe(listener) {
        listenersRef.current.add(listener)
        listener(signalRef.current)
        return () => listenersRef.current.delete(listener)
      },
      start,
      stop,
    }),
    [start, stop],
  )

  return { adapter, errorMessage, toolActivity, toolActive, voiceTurnId }
}
