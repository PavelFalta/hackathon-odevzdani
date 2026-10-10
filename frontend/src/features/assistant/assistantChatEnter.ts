import type { KeyboardEvent } from 'react'

export function assistantChatEnterSubmits(event: KeyboardEvent<HTMLTextAreaElement>): boolean {
  if (event.key !== 'Enter' || event.shiftKey) return false
  if (event.nativeEvent.isComposing) return false
  return true
}
