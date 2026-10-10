import { Orb } from 'orb-ui'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useFloatingWindows } from '../floating-windows/floatingWindowsHooks'
import { useManagedFloatingWindow } from '../floating-windows/useManagedFloatingWindow'
import { assistantTalkOrbTheme, defaultTalkOrbWindowSize } from './talk/assistantTalkOrbTheme'
import { useAssistantTalkSession } from './talk/useAssistantTalkSession'
import { useTalkOrbSurfaceLayout } from './talk/useTalkOrbSurfaceLayout'
import { useTalkOrbTravel } from './talk/useTalkOrbTravel'
import { useThresholdPointer } from './talk/useThresholdPointer'
import './assistant-talk.css'

const TALK_ORB_ID = 'assistant-talk-orb'

type FloatingAssistantTalkProps = {
  open: boolean
  onClose: () => void
}

export function FloatingAssistantTalk({ open, onClose }: FloatingAssistantTalkProps) {
  const fw = useFloatingWindows()
  const { adapter, errorMessage, toolActivity, toolActive, voiceTurnId } =
    useAssistantTalkSession(open)
  const [statusHint, setStatusHint] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const orbHostRef = useRef<HTMLDivElement>(null)
  const syncLayerRef = useTalkOrbSurfaceLayout(orbHostRef)

  useTalkOrbTravel(open, TALK_ORB_ID, toolActive, toolActivity, voiceTurnId)

  const { panelRef, style } = useManagedFloatingWindow({
    id: TALK_ORB_ID,
    kind: 'assistant',
    label: 'Hlas',
    anchor: 'top-right',
    defaultSize: defaultTalkOrbWindowSize(),
    onClose,
    enabled: open,
  })

  const endTalk = useCallback(async () => {
    await adapter.stop?.()
    onClose()
  }, [adapter, onClose])

  useEffect(() => {
    setStatusHint(errorMessage)
  }, [errorMessage])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') void endTalk()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, endTalk])

  const pointer = useThresholdPointer({
    onDrag: (delta) => {
      setDragging(true)
      fw.moveBy(TALK_ORB_ID, delta)
    },
    onDragEnd: () => {
      setDragging(false)
      fw.endDrag(TALK_ORB_ID)
    },
  })

  const onShellPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      fw.bringToFront(TALK_ORB_ID)
      pointer.onPointerDown(event)
    },
    [fw, pointer],
  )

  const onClosePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }, [])

  if (!open) return null

  const showToolBanner = !statusHint && toolActive && Boolean(toolActivity)

  return (
    <div
      ref={panelRef as RefObject<HTMLDivElement | null>}
      className={`assistant-talk-orb${dragging ? ' assistant-talk-orb--dragging' : ''}`}
      style={style}
      data-testid="assistant-talk-orb"
      data-window-id={TALK_ORB_ID}
      data-tool-active={toolActive ? 'true' : 'false'}
      aria-label="Hlasový asistent"
      onPointerDown={onShellPointerDown}
    >
      <div className="assistant-talk-orb__visual-wrap">
        {showToolBanner ? (
          <p className="assistant-talk-orb__tool-banner" role="status">
            {toolActivity}
          </p>
        ) : null}
        <div ref={orbHostRef} className="assistant-talk-orb__orb-host">
          <Orb
            className="assistant-talk-orb__visual"
            adapter={adapter}
            theme={assistantTalkOrbTheme}
            size={188}
            style={{ '--orb-ui-size': '11.75rem' }}
            interactive={false}
            aria-hidden
          />
        </div>
        <div ref={syncLayerRef} className="assistant-talk-orb__sync-layer">
          <div className="assistant-talk-orb__shade" aria-hidden />
          <button
            type="button"
            className="assistant-talk-orb__close"
            onPointerDown={onClosePointerDown}
            onClick={() => void endTalk()}
            aria-label="Ukončit hlasovou konverzaci"
          >
            ✕
          </button>
        </div>
      </div>
      {statusHint ? (
        <p className="assistant-talk-orb__caption assistant-talk-orb__caption--error" role="status">
          {statusHint}
        </p>
      ) : null}
    </div>
  )
}
