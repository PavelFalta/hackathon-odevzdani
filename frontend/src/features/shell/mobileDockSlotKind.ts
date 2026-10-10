import type { FloatingWindowKind } from '../floating-windows/floatingWindowTypes'

export function kindFromDockSlotId(id: string): FloatingWindowKind {
  if (id === 'assistant-chat') return 'assistant'
  if (id.startsWith('reviews-')) return 'reviews'
  if (id.startsWith('photos-')) return 'photos'
  if (id.startsWith('navigation-')) return 'navigation'
  if (id.startsWith('browser-')) return 'browser'
  if (id === 'timetable' || id.startsWith('timetable-')) return 'timetable'
  return 'browser'
}
