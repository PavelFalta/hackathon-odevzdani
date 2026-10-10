import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { MobileDockPortal } from '../shell/MobileDockPortal'
import { TimetableDayList } from './TimetableDayList'
import type { TimetableBoard } from './timetableTypes'
import { TIMETABLE_WINDOW_ID } from './timetableTypes'

type Drag = { onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void }

type TimetablePanelFrameProps = {
  board: TimetableBoard
  title: string
  docked: boolean
  panelRef: RefObject<HTMLElement | null>
  style: CSSProperties | undefined
  drag: Drag
  onClose: () => void
}

export function TimetablePanelFrame({
  board,
  title,
  docked,
  panelRef,
  style,
  drag,
  onClose,
}: TimetablePanelFrameProps) {
  const panelNode = (
    <section
      ref={panelRef}
      className={`timetable-panel kairos-floating-panel${docked ? ' kairos-floating-panel--dock' : ''}`}
      style={style}
      aria-label={`Program: ${title}`}
      data-testid="timetable-panel"
      data-window-id={TIMETABLE_WINDOW_ID}
    >
      <header className="timetable-panel__header">
        <div
          className="timetable-panel__drag kairos-floating-panel__drag"
          onPointerDown={docked ? undefined : drag.onPointerDown}
        >
          {title}
        </div>
        <button
          type="button"
          className="timetable-panel__icon-btn"
          onClick={onClose}
          aria-label="Zavřít program"
          title="Zavřít"
        >
          ✕
        </button>
      </header>
      <TimetableDayList days={board.days} />
    </section>
  )

  if (docked) {
    return (
      <MobileDockPortal
        id={TIMETABLE_WINDOW_ID}
        label={title}
        kind="timetable"
        open
        onClose={onClose}
      >
        {panelNode}
      </MobileDockPortal>
    )
  }

  return panelNode
}
