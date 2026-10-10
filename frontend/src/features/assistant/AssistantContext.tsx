import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useRealtimeAssistant } from './hooks/useRealtimeAssistant'
import type { AssistantMessage, RealtimeAssistantStatus } from './hooks/assistantMessageTypes'

type AssistantContextValue = {
  status: RealtimeAssistantStatus
  error: string | null
  messages: AssistantMessage[]
  turnActivities: string[]
  streaming: boolean
  busy: boolean
  sendMessage: (text: string) => Promise<void>
  reconnect: () => Promise<void>
  setTextSessionEnabled: (enabled: boolean) => void
}

const AssistantContext = createContext<AssistantContextValue | null>(null)

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [textSessionEnabled, setTextSessionEnabled] = useState(false)
  const assistant = useRealtimeAssistant({ enabled: textSessionEnabled })
  const setTextSessionEnabledStable = useCallback(
    (enabled: boolean) => setTextSessionEnabled(enabled),
    [],
  )
  const value: AssistantContextValue = {
    ...assistant,
    setTextSessionEnabled: setTextSessionEnabledStable,
  }
  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider')
  return ctx
}
