import type { OrbState } from 'orb-ui'
import { submitToolResultsAndContinue } from '../realtime/handleToolRound'
import { persistRealtimeTurn } from '../realtime/persistRealtimeTurn'
import type { RealtimeDataChannel } from '../realtime/realtimeTypes'
import { initialVoiceOrbContext, nextVoiceOrbState } from './voiceOrbState'
import { releaseAgentPlaceOrbit } from '../../map/mapPlaceOrbit'
import { parseVoiceServerEvent, voiceEventClearsToolActivity } from './voiceTalkToolActivity'
import { sendVoiceSessionGreeting } from './voiceSessionGreeting'
import { calendarTurnContextEvent } from '../realtime/calendarSnapshot'

type VoiceMessageDeps = {
  channel: RealtimeDataChannel
  orbContextRef: { current: ReturnType<typeof initialVoiceOrbContext> }
  greetingSentRef: { current: boolean }
  setState: (state: OrbState) => void
  getState: () => OrbState
  setError: (message: string | null) => void
  onToolActivity?: (label: string) => void
  clearToolActivity?: () => void
  onUserTurnStart?: () => void
  conversationIdRef?: { current: string | null }
  turnActivitiesRef?: { current: string[] }
  turnToolNamesRef?: { current: string[] }
}

export async function processVoiceServerMessage(
  raw: string,
  deps: VoiceMessageDeps,
): Promise<void> {
  const event = parseVoiceServerEvent(raw)
  if (!event) return

  if (voiceEventClearsToolActivity(event)) deps.clearToolActivity?.()

  if (event.type === 'session.created' && !deps.greetingSentRef.current) {
    deps.greetingSentRef.current = true
    sendVoiceSessionGreeting(deps.channel)
  }

  if (event.type === 'input_audio_buffer.speech_started') {
    if (deps.channel.readyState === 'open') deps.channel.send(calendarTurnContextEvent())
    releaseAgentPlaceOrbit()
    deps.onUserTurnStart?.()
  }

  const mapped = nextVoiceOrbState(event.type, deps.orbContextRef.current, deps.getState())
  deps.orbContextRef.current = mapped.ctx
  if (mapped.state !== deps.getState()) deps.setState(mapped.state)

  if (event.type === 'response.done') {
    if (event.response?.status === 'failed') {
      deps.setError('Odpověď hlasového modelu selhala.')
      deps.setState('error')
      return
    }
    const hadTools =
      deps.channel.readyState === 'open'
        ? await submitToolResultsAndContinue(
            deps.channel,
            event.response,
            (label) => {
              deps.turnActivitiesRef?.current.push(label)
              deps.onToolActivity?.(label)
            },
            'audio',
            (name) => {
              deps.turnToolNamesRef?.current.push(name)
            },
          )
        : false
    if (hadTools) {
      deps.setState('thinking')
      return
    }
    const conversationId = deps.conversationIdRef?.current
    if (conversationId) {
      void persistRealtimeTurn({
        conversationId,
        mode: 'voice',
        toolLabels: deps.turnActivitiesRef?.current ?? [],
        toolNames: deps.turnToolNamesRef?.current ?? [],
        response: event.response,
      })
      if (deps.turnActivitiesRef) deps.turnActivitiesRef.current = []
      if (deps.turnToolNamesRef) deps.turnToolNamesRef.current = []
    }
    return
  }

  if (event.type === 'error') {
    const detail = event.error?.message?.trim()
    deps.setError(detail || 'Chyba hlasové relace v reálném čase.')
    deps.setState('error')
  }
}
