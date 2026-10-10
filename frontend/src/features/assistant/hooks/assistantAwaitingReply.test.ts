import { describe, expect, it } from 'vitest'
import { assistantAwaitingReply } from './assistantAwaitingReply'
import type { AssistantMessage } from './assistantMessageTypes'

describe('assistantAwaitingReply', () => {
  it('is true while busy before assistant text', () => {
    const messages: AssistantMessage[] = [{ role: 'user', content: 'Hi' }]
    expect(assistantAwaitingReply(true, messages)).toBe(true)
  })

  it('stays true after activity lines until assistant text arrives', () => {
    const messages: AssistantMessage[] = [
      { role: 'user', content: 'Hi' },
      { role: 'activity', content: 'Prohledávám…' },
    ]
    expect(assistantAwaitingReply(true, messages)).toBe(true)
  })

  it('is false once assistant content exists', () => {
    const messages: AssistantMessage[] = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
    ]
    expect(assistantAwaitingReply(true, messages)).toBe(false)
  })
})
