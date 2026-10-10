import { realtimeCallsUrl } from './realtimeCallsUrl'
import type { RealtimeDataChannel, RealtimePeer } from './realtimeTypes'

export type RealtimeCallConnection = {
  dataChannel: RealtimeDataChannel
  peer: RealtimePeer
  close: () => void
}

const ICE_GATHER_TIMEOUT_MS = 4_000

async function waitForIceGathering(peer: RealtimePeer): Promise<void> {
  if (peer.iceGatheringState === 'complete') return
  await new Promise<void>((resolve) => {
    const timer = window.setTimeout(() => {
      peer.removeEventListener('icegatheringstatechange', onChange)
      resolve()
    }, ICE_GATHER_TIMEOUT_MS)
    const onChange = () => {
      if (peer.iceGatheringState === 'complete') {
        window.clearTimeout(timer)
        peer.removeEventListener('icegatheringstatechange', onChange)
        resolve()
      }
    }
    peer.addEventListener('icegatheringstatechange', onChange)
    onChange()
  })
}

export async function negotiateRealtimeCall(
  clientSecret: string,
  preparePeer: (peer: RTCPeerConnection, dataChannel: RealtimeDataChannel) => void | Promise<void>,
): Promise<RealtimeCallConnection> {
  const rtc = new RTCPeerConnection()
  const dataChannel = rtc.createDataChannel('oai-events') as RealtimeDataChannel
  await preparePeer(rtc, dataChannel)

  const offer = await rtc.createOffer()
  await rtc.setLocalDescription(offer)
  await waitForIceGathering(rtc)

  const sdp = rtc.localDescription?.sdp
  if (!sdp) {
    rtc.close()
    throw new Error('Chybí SDP nabídka WebRTC')
  }

  const response = await fetch(realtimeCallsUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      'Content-Type': 'application/sdp',
    },
    body: sdp,
  })
  if (response.status < 200 || response.status >= 300) {
    const detail = await response.text()
    rtc.close()
    throw new Error(`Hlasové volání selhalo (${response.status}): ${detail.slice(0, 200)}`)
  }

  const answerSdp = await response.text()
  await rtc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

  const peer = rtc as RealtimePeer
  const close = () => {
    dataChannel.close()
    rtc.close()
  }

  return { dataChannel, peer, close }
}
