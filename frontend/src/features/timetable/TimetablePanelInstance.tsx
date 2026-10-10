import { defaultTimetableWindowSize } from '../floating-windows/floatingWindowDefaults'
import { useShellPanelPresentation } from '../shell/useShellPanelPresentation'
import { TimetablePanelFrame } from './TimetablePanelFrame'
import { useTimetable } from './TimetableContext'
import { TIMETABLE_WINDOW_ID } from './timetableTypes'
import './timetable-panel.css'

export function TimetablePanelInstance() {
  const { board, close } = useTimetable()
  const title = board?.title ?? 'Program'
  const { docked, panelRef, style, drag } = useShellPanelPresentation({
    id: TIMETABLE_WINDOW_ID,
    kind: 'timetable',
    label: title,
    anchor: 'top-right',
    defaultSize: defaultTimetableWindowSize(),
    onClose: close,
    enabled: board !== null,
  })

  if (!board) return null

  return (
    <TimetablePanelFrame
      board={board}
      title={title}
      docked={docked}
      panelRef={panelRef}
      style={style}
      drag={drag}
      onClose={close}
    />
  )
}
