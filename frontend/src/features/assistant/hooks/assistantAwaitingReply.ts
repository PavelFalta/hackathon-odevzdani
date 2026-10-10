import type { AssistantMessage } from './assistantMessageTypes'

function lastAssistantMessage(messages: AssistantMessage[]): AssistantMessage | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') return messages[i]
  }
  return undefined
}

export function assistantAwaitingReply(busy: boolean, messages: AssistantMessage[]): boolean {
  if (!busy) return false
  const last = lastAssistantMessage(messages)
  return !last || last.content.length === 0
}
