import { useEffect, type CSSProperties, type PointerEvent, type RefObject } from 'react'
import { MobileDockPortal } from '../shell/MobileDockPortal'
import { useShellPanelPresentation } from '../shell/useShellPanelPresentation'
import { useAssistant } from './AssistantContext'
import { AssistantChatBody } from './AssistantChatBody'
import { assistantStatusLabel } from './assistantStatusLabel'
import { defaultAssistantWindowSize } from '../floating-windows/floatingWindowDefaults'
import './assistant.css'

const CHAT_WINDOW_ID = 'assistant-chat'

type FloatingAssistantChatProps = {
  open: boolean
  onClose: () => void
}

function AssistantChatPanel({
  docked,
  panelRef,
  style,
  drag,
  onClose,
}: {
  docked: boolean
  panelRef: RefObject<HTMLElement | null>
  style?: CSSProperties
  drag: { onPointerDown: (event: PointerEvent<HTMLElement>) => void }
  onClose: () => void
}) {
  const { status } = useAssistant()

  return (
    <section
      ref={panelRef}
      className={`assistant-chat-panel kairos-floating-panel${docked ? ' kairos-floating-panel--dock' : ''}`}
      style={style}
      aria-label="Asistent mapy"
      data-testid="assistant-chat-panel"
      data-window-id={CHAT_WINDOW_ID}
    >
      <header className="assistant-chat-panel__header">
        <div
          className="assistant-chat-panel__drag kairos-floating-panel__drag"
          onPointerDown={docked ? undefined : drag.onPointerDown}
        >
          <span className="assistant-chat-panel__title">Asistent</span>
          <span className="assistant-status" data-state={status}>
            {assistantStatusLabel(status)}
          </span>
        </div>
        <button
          type="button"
          className="assistant-chat-panel__icon-btn"
          onClick={onClose}
          aria-label="Sbalit chat asistenta"
          title="Sbalit"
        >
          ✕
        </button>
      </header>
      <div className="assistant-chat-panel__body">
        <AssistantChatBody />
      </div>
    </section>
  )
}

export function FloatingAssistantChat({ open, onClose }: FloatingAssistantChatProps) {
  const { setTextSessionEnabled } = useAssistant()

  useEffect(() => {
    if (!open) return
    setTextSessionEnabled(true)
    return () => setTextSessionEnabled(false)
  }, [open, setTextSessionEnabled])

  const { docked, panelRef, style, drag } = useShellPanelPresentation({
    id: CHAT_WINDOW_ID,
    kind: 'assistant',
    label: 'Chat',
    anchor: 'bottom-left',
    defaultSize: defaultAssistantWindowSize(),
    onClose,
    enabled: open,
    dockOnMobile: true,
  })

  if (!open) return null

  const panel = (
    <AssistantChatPanel
      docked={docked}
      panelRef={panelRef}
      style={style}
      drag={drag}
      onClose={onClose}
    />
  )

  if (docked) {
    return (
      <MobileDockPortal
        id={CHAT_WINDOW_ID}
        label="Chat"
        kind="assistant"
        open={open}
        onClose={onClose}
      >
        {panel}
      </MobileDockPortal>
    )
  }

  return panel
}
