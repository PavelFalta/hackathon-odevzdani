import { useLayoutEffect, useRef } from 'react'
import type { AssistantMessage } from './assistantMessageTypes'

/** Keeps the message list pinned to the latest content while streaming. */
export function useAssistantThreadScroll(messages: AssistantMessage[], busy: boolean) {
  const threadRef = useRef<HTMLDivElement>(null)
  const tail = messages.length > 0 ? messages[messages.length - 1].content : ''
  const scrollToken = `${messages.length}:${tail}:${busy}`

  useLayoutEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [scrollToken])

  return threadRef
}
