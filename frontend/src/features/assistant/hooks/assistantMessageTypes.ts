export type AssistantMessageRole = 'user' | 'assistant' | 'activity'

export type AssistantMessage = { role: AssistantMessageRole; content: string }

export type RealtimeAssistantStatus = 'idle' | 'connecting' | 'ready' | 'error'
