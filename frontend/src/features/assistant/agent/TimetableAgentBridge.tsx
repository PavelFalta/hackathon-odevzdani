import { useEffect } from 'react'
import { registerAgentAction } from './agentActionsRef'
import { parseTimetablePayload } from '../../timetable/parseTimetablePayload'
import { useTimetable } from '../../timetable/TimetableContext'

export function TimetableAgentBridge() {
  const { show } = useTimetable()

  useEffect(() => {
    return registerAgentAction('showTimetable', async (argumentsJson) => {
      const parsed = parseTimetablePayload(argumentsJson)
      if ('error' in parsed) return JSON.stringify({ ok: false, error: parsed.error })
      const windowId = show(parsed)
      const eventCount = parsed.days.reduce((count, day) => count + day.events.length, 0)
      return JSON.stringify({
        ok: true,
        window_id: windowId,
        day_count: parsed.days.length,
        event_count: eventCount,
      })
    })
  }, [show])

  return null
}
