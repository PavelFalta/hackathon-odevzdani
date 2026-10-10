import { agentActionsRef } from '../agent/agentActionsRef'
import { calendarSnapshotText } from './calendarSnapshot'
import type { RealtimeDataChannel } from './realtimeTypes'

export function openWindowsTurnContextEvent(windowsJson: string): string {
  return JSON.stringify({
    type: 'conversation.item.create',
    item: {
      type: 'message',
      role: 'user',
      content: [
        {
          type: 'input_text',
          text:
            `[App context — ${calendarSnapshotText()} ` +
            'Open UI windows snapshot before this turn: ' +
            `${windowsJson}. ` +
            'Start your tool work with list_open_windows, reconcile with this snapshot, ' +
            'then close_window on reviews/browser/navigation/timetable panels not relevant to the user’s latest request. ' +
            'Do not close the assistant window unless asked. ' +
            'Use search_web up to three times per turn (refine queries) as last resort after '
            + 'regional knowledge / Mapbox / reviews fail, or for outings after they narrowed '
            + 'what they want.]',
        },
      ],
    },
  })
}

export async function sendOpenWindowsTurnContext(channel: RealtimeDataChannel): Promise<void> {
  const listOpen = agentActionsRef.current.listOpenWindows
  if (!listOpen || channel.readyState !== 'open') return
  const windowsJson = await listOpen()
  channel.send(openWindowsTurnContextEvent(windowsJson))
}
