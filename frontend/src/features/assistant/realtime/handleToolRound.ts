import { toolActivityLabel } from '../assistantToolActivityLabel'
import type { RealtimeDataChannel } from './realtimeTypes'
import {
  extractFunctionCalls,
  functionOutputEvent,
  textResponseEvent,
  voiceResponseEvent,
} from './realtimeEvents'
import { orderToolCallsForExecution } from './orderToolCalls'
import { runAgentTool } from './runAgentTool'
import type { RealtimeResponsePayload } from './realtimeTypes'

export type RealtimeResponseMode = 'text' | 'audio'

export async function submitToolResultsAndContinue(
  channel: RealtimeDataChannel,
  response: RealtimeResponsePayload | undefined,
  onActivity?: (content: string) => void,
  responseMode: RealtimeResponseMode = 'text',
  onToolInvoked?: (toolName: string) => void,
): Promise<boolean> {
  const calls = orderToolCallsForExecution(extractFunctionCalls(response))
  if (!calls.length) return false

  for (const call of calls) {
    const name = call.name ?? ''
    const args = call.arguments ?? '{}'
    if (name) onToolInvoked?.(name)
    onActivity?.(toolActivityLabel(name, args))
    const output = await runAgentTool(name, args)
    channel.send(functionOutputEvent(call.call_id ?? '', output))
  }
  channel.send(responseMode === 'audio' ? voiceResponseEvent() : textResponseEvent())
  return true
}
