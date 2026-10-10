import type { Dispatch, SetStateAction } from 'react'
import type { AssistantMessage } from '../hooks/assistantMessageTypes'
import { parseServerEvent } from './realtimeEvents'
import { submitToolResultsAndContinue } from './handleToolRound'
import { persistRealtimeTurn } from './persistRealtimeTurn'
import type { RealtimeDataChannel } from './realtimeTypes'

type ServerMessageDeps = {
  channel: RealtimeDataChannel | undefined
  assistantDraftRef: { current: string }
  conversationIdRef: { current: string | null }
  lastUserTextRef: { current: string | null }
  turnActivitiesRef: { current: string[] }
  turnToolNamesRef: { current: string[] }
  setMessages: Dispatch<SetStateAction<AssistantMessage[]>>
  setStreaming: Dispatch<SetStateAction<boolean>>
  setBusy: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string | null>>
  setStatus: Dispatch<SetStateAction<'idle' | 'connecting' | 'ready' | 'error'>>
  onActivity?: (content: string) => void
}

export async function processServerMessage(raw: string, deps: ServerMessageDeps): Promise<void> {
  const event = parseServerEvent(raw)
  if (!event) return

  if (event.type === 'session.created' || event.type === 'session.updated') {
    deps.setStatus('ready')
    return
  }

  if (event.type === 'response.output_text.delta' && event.delta) {
    deps.assistantDraftRef.current += event.delta
    const draft = deps.assistantDraftRef.current
    deps.setMessages((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === 'assistant') {
        next[next.length - 1] = { role: 'assistant', content: draft }
        return next
      }
      next.push({ role: 'assistant', content: draft })
      return next
    })
    return
  }

  if (event.type === 'response.done') {
    const channel = deps.channel
    const hadTools =
      channel && channel.readyState === 'open'
        ? await submitToolResultsAndContinue(
            channel,
            event.response,
            (content) => {
              deps.turnActivitiesRef.current.push(content)
              deps.onActivity?.(content)
            },
            'text',
            (name) => {
              deps.turnToolNamesRef.current.push(name)
            },
          )
        : false
    if (hadTools) {
      deps.assistantDraftRef.current = ''
      deps.setStreaming(true)
      deps.setBusy(true)
      return
    }
    const conversationId = deps.conversationIdRef.current
    if (conversationId) {
      void persistRealtimeTurn({
        conversationId,
        mode: 'text',
        userText: deps.lastUserTextRef.current ?? undefined,
        assistantText: deps.assistantDraftRef.current,
        toolLabels: deps.turnActivitiesRef.current,
        toolNames: deps.turnToolNamesRef.current,
        response: event.response,
      })
    }
    deps.lastUserTextRef.current = null
    deps.turnActivitiesRef.current = []
    deps.turnToolNamesRef.current = []
    deps.setStreaming(false)
    deps.setBusy(false)
    return
  }

  if (event.type === 'error') {
    deps.setError('Chyba relace v reálném čase.')
    deps.setStreaming(false)
    deps.setBusy(false)
  }
}
