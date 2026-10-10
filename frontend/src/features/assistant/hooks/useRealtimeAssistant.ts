import { useCallback, useEffect, useRef, useState } from 'react'
import { connectRealtimeTextSession } from '../realtime/connectRealtimeText'
import { textResponseEvent, userTextEvent } from '../realtime/realtimeEvents'
import { processServerMessage } from '../realtime/processServerMessage'
import type { RealtimeTextConnection } from '../realtime/connectRealtimeText'
import { sendOpenWindowsTurnContext } from '../realtime/sendOpenWindowsTurnContext'
import { waitForOpenDataChannel } from '../realtime/waitForOpenDataChannel'
import { resetAgentToolMapFocusTurn } from '../../map/mapAgentToolFocusTurn'
import { releaseAgentPlaceOrbit } from '../../map/mapPlaceOrbit'
import type { AssistantMessage, RealtimeAssistantStatus } from './assistantMessageTypes'

type UseRealtimeAssistantOptions = {
  enabled?: boolean
}

export function useRealtimeAssistant(options?: UseRealtimeAssistantOptions) {
  const enabled = options?.enabled ?? true
  const connectionRef = useRef<RealtimeTextConnection | null>(null)
  const assistantDraftRef = useRef('')
  const conversationIdRef = useRef<string | null>(null)
  const lastUserTextRef = useRef<string | null>(null)
  const turnActivitiesRef = useRef<string[]>([])
  const turnToolNamesRef = useRef<string[]>([])
  const [status, setStatus] = useState<RealtimeAssistantStatus>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [turnActivities, setTurnActivities] = useState<string[]>([])
  const [streaming, setStreaming] = useState(false)
  const [busy, setBusy] = useState(false)

  const bindConnection = useCallback((conn: RealtimeTextConnection) => {
    connectionRef.current = conn
    conversationIdRef.current = conn.conversationId
    const handler = (messageEvent: Event) => {
      const data =
        messageEvent instanceof MessageEvent && typeof messageEvent.data === 'string'
          ? messageEvent.data
          : ''
      void processServerMessage(data, {
        channel: connectionRef.current?.dataChannel,
        assistantDraftRef,
        conversationIdRef,
        lastUserTextRef,
        turnActivitiesRef,
        turnToolNamesRef,
        setMessages,
        setStreaming,
        setBusy,
        setError,
        setStatus,
        onActivity: (content) => {
          setTurnActivities((prev) => [...prev, content])
        },
      })
    }
    conn.dataChannel.addEventListener('message', handler)
    if (conn.dataChannel.readyState === 'open') {
      setStatus('ready')
    } else {
      conn.dataChannel.addEventListener('open', () => setStatus('ready'))
    }
  }, [])

  const connect = useCallback(async () => {
    if (connectionRef.current) return
    setStatus('connecting')
    setError(null)
    try {
      bindConnection(await connectRealtimeTextSession())
    } catch {
      setStatus('error')
      setError('Nepodařilo se otevřít relaci v reálném čase. Zkontroluj klíč OpenAI na serveru.')
    }
  }, [bindConnection])

  useEffect(() => {
    if (!enabled) {
      connectionRef.current?.close()
      connectionRef.current = null
      setStatus('idle')
      return
    }
    void connect()
    return () => {
      connectionRef.current?.close()
      connectionRef.current = null
    }
  }, [connect, enabled])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || busy) return
      releaseAgentPlaceOrbit()
      resetAgentToolMapFocusTurn()
      setError(null)
      setBusy(true)
      setStreaming(true)
      setTurnActivities([])
      turnActivitiesRef.current = []
      turnToolNamesRef.current = []
      assistantDraftRef.current = ''
      lastUserTextRef.current = trimmed
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
      try {
        const channel = await waitForOpenDataChannel(() => connectionRef.current)
        await sendOpenWindowsTurnContext(channel)
        channel.send(userTextEvent(trimmed))
        channel.send(textResponseEvent())
      } catch {
        setBusy(false)
        setStreaming(false)
        setError('Komunikační kanál zatím není připraven. Zkus to znovu za chvíli.')
      }
    },
    [busy],
  )

  return {
    status,
    error,
    messages,
    turnActivities,
    streaming,
    busy,
    sendMessage,
    reconnect: connect,
  }
}
