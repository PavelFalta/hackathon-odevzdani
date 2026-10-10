import { postJson } from './client'

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export type ChatResponse = { message: string; sources: Record<string, unknown>[] }

export async function sendChat(messages: ChatMessage[]): Promise<ChatResponse> {
  return postJson<ChatResponse>('/api/assistant/chat', { messages }, true)
}
