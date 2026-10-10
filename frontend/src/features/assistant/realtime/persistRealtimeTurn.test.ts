import { describe, expect, it, vi, beforeEach } from 'vitest'
import { persistRealtimeTurn } from './persistRealtimeTurn'

vi.mock('../../../api/conversations', () => ({
  appendConversationTurn: vi.fn(),
}))

import { appendConversationTurn } from '../../../api/conversations'

describe('persistRealtimeTurn', () => {
  beforeEach(() => {
    vi.mocked(appendConversationTurn).mockReset()
  })

  it('records tool usage from tool names collected during the turn', async () => {
    await persistRealtimeTurn({
      conversationId: 'conv-1',
      mode: 'text',
      userText: 'ahoj',
      assistantText: 'ok',
      toolLabels: ['Hledám…', 'Plánuji trasu…'],
      toolNames: ['search_regional_knowledge', 'plan_route'],
      response: { usage: { input_tokens: 10, output_tokens: 2 } },
    })

    expect(appendConversationTurn).toHaveBeenCalledWith('conv-1', {
      items: [
        { kind: 'user_message', body: 'ahoj' },
        { kind: 'assistant_message', body: 'ok' },
        { kind: 'tool', body: 'Hledám…', tool_name: 'search_regional_knowledge' },
        { kind: 'tool', body: 'Plánuji trasu…', tool_name: 'plan_route' },
      ],
      usage: [
        {
          category: 'openai_realtime',
          label: 'response',
          quantity: 1,
          input_tokens: 10,
          output_tokens: 2,
        },
        { category: 'tool', label: 'search_regional_knowledge', quantity: 1 },
        { category: 'tool', label: 'plan_route', quantity: 1 },
      ],
    })
  })
})
