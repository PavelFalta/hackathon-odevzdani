import { setConversationId } from '../../../api/client'
import { fetchRealtimeVoiceClientSecret } from '../../../api/realtime'
import { negotiateRealtimeCall } from './negotiateRealtimeCall'
import type { RealtimeDataChannel, RealtimePeer } from './realtimeTypes'
import { createTalkOrbMeters } from '../talk/talkOrbAudioMeter'

export type RealtimeVoiceHandlers = {
  onMessage: (raw: string, channel: RealtimeDataChannel) => void
  onChannelOpen?: (channel: RealtimeDataChannel) => void
  onInputLevel?: (level: number) => void
  onOutputLevel?: (level: number) => void
}

export type RealtimeVoiceConnection = {
  dataChannel: RealtimeDataChannel
  peer: RealtimePeer
  mediaStream: MediaStream
  remoteAudio: HTMLAudioElement
  conversationId: string
  close: () => void
}

function onVoiceChannelReady(dc: RealtimeDataChannel, handlers: RealtimeVoiceHandlers): void {
  handlers.onChannelOpen?.(dc)
}

export async function connectRealtimeVoiceSession(
  handlers: RealtimeVoiceHandlers,
): Promise<RealtimeVoiceConnection> {
  const { client_secret, conversation_id } = await fetchRealtimeVoiceClientSecret()
  setConversationId(conversation_id)
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const remoteAudio = document.createElement('audio')
  remoteAudio.autoplay = true
  remoteAudio.setAttribute('playsinline', 'true')
  document.body.appendChild(remoteAudio)

  const meters = createTalkOrbMeters(
    (rms) => handlers.onInputLevel?.(rms),
    (rms) => handlers.onOutputLevel?.(rms),
  )

  const {
    dataChannel,
    peer,
    close: closePeer,
  } = await negotiateRealtimeCall(client_secret, (rtc, dc) => {
    dc.addEventListener('message', (event) => {
      if (event instanceof MessageEvent && typeof event.data === 'string') {
        handlers.onMessage(event.data, dc)
      }
    })
    dc.addEventListener('open', () => onVoiceChannelReady(dc, handlers))
    mediaStream.getAudioTracks().forEach((track) => rtc.addTrack(track, mediaStream))
    rtc.ontrack = (trackEvent) => {
      const remote = trackEvent.streams[0] ?? new MediaStream([trackEvent.track])
      remoteAudio.srcObject = remote
      void remoteAudio.play().catch(() => undefined)
      meters.attachOutput(remote)
    }
  })

  meters.attachInput(mediaStream)

  if (dataChannel.readyState === 'open') onVoiceChannelReady(dataChannel, handlers)

  const close = () => {
    void meters.stop()
    mediaStream.getTracks().forEach((track) => track.stop())
    remoteAudio.pause()
    remoteAudio.srcObject = null
    remoteAudio.remove()
    closePeer()
  }

  return { dataChannel, peer, mediaStream, remoteAudio, conversationId: conversation_id, close }
}
