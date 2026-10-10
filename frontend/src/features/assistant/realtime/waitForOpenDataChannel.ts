import type { RealtimeTextConnection } from './connectRealtimeText'
import type { RealtimeDataChannel } from './realtimeTypes'

const POLL_MS = 40
const TIMEOUT_MS = 45_000

export function waitForOpenDataChannel(
  getConnection: () => RealtimeTextConnection | null,
): Promise<RealtimeDataChannel> {
  return new Promise((resolve, reject) => {
    const started = Date.now()

    function attempt() {
      const channel = getConnection()?.dataChannel
      if (channel?.readyState === 'open') {
        resolve(channel)
        return
      }
      if (Date.now() - started > TIMEOUT_MS) {
        reject(new Error('realtime_channel_timeout'))
        return
      }
      window.setTimeout(attempt, POLL_MS)
    }

    attempt()
  })
}
