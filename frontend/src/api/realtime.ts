import { postJson } from './client'

export type RealtimeClientSecret = {
  client_secret: string
  expires_at: number
  conversation_id: string
}

export type RealtimeSessionMode = 'text' | 'voice'

export async function fetchRealtimeClientSecret(
  mode: RealtimeSessionMode = 'text',
): Promise<RealtimeClientSecret> {
  return postJson<RealtimeClientSecret>('/api/assistant/realtime/client-secret', { mode }, true)
}

export async function fetchRealtimeVoiceClientSecret(): Promise<RealtimeClientSecret> {
  return fetchRealtimeClientSecret('voice')
}
