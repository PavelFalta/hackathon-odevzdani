import { setConversationId } from '../../../api/client'
import { fetchRealtimeClientSecret } from '../../../api/realtime'
import { negotiateRealtimeCall } from './negotiateRealtimeCall'
import type { RealtimeDataChannel, RealtimePeer } from './realtimeTypes'

export type RealtimeTextConnection = {
  dataChannel: RealtimeDataChannel
  peer: RealtimePeer
  conversationId: string
  close: () => void
}

export async function connectRealtimeTextSession(): Promise<RealtimeTextConnection> {
  const { client_secret, conversation_id } = await fetchRealtimeClientSecret()
  setConversationId(conversation_id)
  const negotiated = await negotiateRealtimeCall(client_secret, (rtc) => {
    rtc.addTransceiver('audio')
  })
  return { ...negotiated, conversationId: conversation_id }
}
