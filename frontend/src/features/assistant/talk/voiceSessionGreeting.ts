import { voiceGreetingResponseEvent } from '../realtime/realtimeEvents'
import type { RealtimeDataChannel } from '../realtime/realtimeTypes'

export function sendVoiceSessionGreeting(channel: RealtimeDataChannel): void {
  if (channel.readyState !== 'open') return
  channel.send(voiceGreetingResponseEvent())
}
