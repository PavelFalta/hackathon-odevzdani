import { appendConversationTurn, type TurnItem, type TurnUsage } from '../../../api/conversations'
import type { RealtimeResponsePayload } from './realtimeTypes'

type PersistTurnInput = {
  conversationId: string
  mode: 'text' | 'voice'
  userText?: string
  assistantText?: string
  toolLabels: string[]
  toolNames: string[]
  response?: RealtimeResponsePayload
}

function usageFromResponse(response?: RealtimeResponsePayload): TurnUsage[] {
  const usage = response?.usage
  if (!usage) return []
  const input = usage.input_tokens ?? usage.total_tokens
  const output = usage.output_tokens
  if (input == null && output == null) return []
  return [
    {
      category: 'openai_realtime',
      label: 'response',
      quantity: 1,
      input_tokens: input ?? null,
      output_tokens: output ?? null,
    },
  ]
}

function toolUsageFromNames(toolNames: string[]): TurnUsage[] {
  return toolNames.map((name) => ({
    category: 'tool',
    label: name || 'unknown_tool',
    quantity: 1,
  }))
}

export async function persistRealtimeTurn(input: PersistTurnInput): Promise<void> {
  const items: TurnItem[] = []
  const trimmedUser = input.userText?.trim()
  const trimmedAssistant = input.assistantText?.trim()

  if (input.mode === 'text') {
    if (trimmedUser) items.push({ kind: 'user_message', body: trimmedUser })
    if (trimmedAssistant) items.push({ kind: 'assistant_message', body: trimmedAssistant })
  }

  input.toolLabels.forEach((label, index) => {
    const body = label.trim()
    if (!body) return
    const toolName = input.toolNames[index]?.trim() || null
    items.push({ kind: 'tool', body, tool_name: toolName })
  })

  const usage = [...usageFromResponse(input.response), ...toolUsageFromNames(input.toolNames)]
  if (!items.length && !usage.length) return

  try {
    await appendConversationTurn(input.conversationId, { items, usage })
  } catch {
    /* demo: ignore persistence errors */
  }
}
