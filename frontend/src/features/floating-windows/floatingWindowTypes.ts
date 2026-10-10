export type FloatingWindowKind =
  'assistant' | 'reviews' | 'photos' | 'browser' | 'navigation' | 'timetable'

export type FloatingRect = {
  x: number
  y: number
  w: number
  h: number
}

export type FloatingCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/** Preferred screen corner for a panel; layout may assign another free corner. */
export type FloatingAnchor = FloatingCorner

export type FloatingWindowRecord = {
  id: string
  kind: FloatingWindowKind
  label: string
  rect: FloatingRect
  zIndex: number
  /** User intentionally stacked this window on another (overlap allowed). */
  userStacked: boolean
  anchor: FloatingAnchor
}
