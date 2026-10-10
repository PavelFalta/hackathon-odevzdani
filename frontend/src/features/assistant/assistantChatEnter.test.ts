import { describe, expect, it } from 'vitest'
import { assistantChatEnterSubmits } from './assistantChatEnter'

function keyEvent(key: string, opts: { shiftKey?: boolean; isComposing?: boolean } = {}) {
  return {
    key,
    shiftKey: opts.shiftKey ?? false,
    nativeEvent: { isComposing: opts.isComposing ?? false },
  } as unknown as import('react').KeyboardEvent<HTMLTextAreaElement>
}

describe('assistantChatEnterSubmits', () => {
  it('submits on Enter without Shift', () => {
    expect(assistantChatEnterSubmits(keyEvent('Enter'))).toBe(true)
  })

  it('does not submit on Shift+Enter', () => {
    expect(assistantChatEnterSubmits(keyEvent('Enter', { shiftKey: true }))).toBe(false)
  })

  it('ignores Enter while composing IME text', () => {
    expect(assistantChatEnterSubmits(keyEvent('Enter', { isComposing: true }))).toBe(false)
  })
})
