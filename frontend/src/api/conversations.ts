import { postJson } from './client'
import { getJson } from './client'

export type ConversationSummary = {
  id: string
  mode: string
  title: string | null
  created_at: string
  updated_at: string
}

export type ConversationItem = {
  kind: string
  body: string
  tool_name: string | null
  created_at: string
}

export type ConversationDetail = ConversationSummary & {
  items: ConversationItem[]
}

export type TurnItem = {
  kind: 'user_message' | 'assistant_message' | 'tool'
  body: string
  tool_name?: string | null
}

export type TurnUsage = {
  category?: string
  label: string
  quantity?: number
  input_tokens?: number | null
  output_tokens?: number | null
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  return getJson('/api/assistant/conversations')
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  return getJson(`/api/assistant/conversations/${id}`)
}

export async function appendConversationTurn(
  conversationId: string,
  payload: { items: TurnItem[]; usage: TurnUsage[] },
): Promise<void> {
  await postJson(`/api/assistant/conversations/${conversationId}/turns`, payload, true)
}
