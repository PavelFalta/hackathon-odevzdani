import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useAssistant } from './AssistantContext'
import { assistantChatEnterSubmits } from './assistantChatEnter'
import { assistantAwaitingReply } from './hooks/assistantAwaitingReply'
import { AssistantMessageContent } from './AssistantMessageContent'
import { AssistantWorkPanel } from './AssistantWorkPanel'
import { useAssistantThreadScroll } from './hooks/useAssistantThreadScroll'

export function AssistantChatBody() {
  const [input, setInput] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const wasBusyRef = useRef(false)
  const { status, error, messages, turnActivities, busy, sendMessage, reconnect } = useAssistant()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (wasBusyRef.current && !busy && status !== 'error') {
      inputRef.current?.focus()
    }
    wasBusyRef.current = busy
  }, [busy, status])
  const awaitingReply = assistantAwaitingReply(busy, messages)
  const threadRef = useAssistantThreadScroll(messages, busy)
  const canType = status !== 'error' && !busy
  const canSend = canType && input.trim().length > 0

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const text = input.trim()
    if (!text || !canSend) return
    await sendMessage(text)
    setInput('')
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!assistantChatEnterSubmits(event)) return
    event.preventDefault()
    if (!canSend) return
    formRef.current?.requestSubmit()
  }

  return (
    <>
      {status === 'error' ? (
        <button type="button" className="assistant-retry" onClick={() => void reconnect()}>
          Zkusit znovu
        </button>
      ) : null}
      <div ref={threadRef} className="assistant-thread kairos-scroll" aria-live="polite">
        {messages
          .filter((message) => message.role !== 'activity')
          .map((message, index) => (
            <p
              key={index}
              className={`assistant-bubble assistant-bubble--${message.role}`}
              data-role={message.role}
            >
              {message.role === 'assistant' ? (
                <AssistantMessageContent content={message.content} />
              ) : (
                message.content
              )}
            </p>
          ))}
        <AssistantWorkPanel steps={turnActivities} busy={busy} />
        {busy && !awaitingReply ? (
          <p className="assistant-bubble assistant-bubble--assistant assistant-bubble--status">
            Píšu odpověď…
          </p>
        ) : null}
      </div>
      <form ref={formRef} className="assistant-chat-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="assistant-input">
          Zeptej se na mapu
        </label>
        <textarea
          ref={inputRef}
          id="assistant-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Zeptej se na mapu…"
          disabled={!canType}
        />
        <button type="submit" disabled={!canSend}>
          {busy ? 'Přemýšlím…' : 'Odeslat'}
        </button>
      </form>
      {error ? (
        <p className="assistant-error" role="alert">
          {error}
        </p>
      ) : null}
    </>
  )
}
