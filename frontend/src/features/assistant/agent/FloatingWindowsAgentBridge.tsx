import { useEffect } from 'react'
import { useFloatingWindowsActions } from '../../floating-windows/floatingWindowsHooks'
import { useMobileDockOptional } from '../../shell/MobileDockContext'
import { useIsMobileShell } from '../../shell/useIsMobileShell'
import { registerAgentAction } from './agentActionsRef'

export function FloatingWindowsAgentBridge() {
  const fw = useFloatingWindowsActions()
  const mobile = useIsMobileShell()
  const dock = useMobileDockOptional()

  useEffect(() => {
    const unregisters = [
      registerAgentAction('listOpenWindows', async () => {
        if (mobile && dock) {
          return JSON.stringify({ windows: dock.listSlots() })
        }
        return JSON.stringify({ windows: fw.listWindows() })
      }),
      registerAgentAction('closeUiWindow', async (windowId) => {
        const id = windowId.trim()
        if (!id) return JSON.stringify({ ok: false, error: 'window_id_required' })
        const closed =
          mobile && dock ? dock.closeSlot(id) : fw.closeWindow(id)
        return JSON.stringify(
          closed ? { ok: true, window_id: id } : { ok: false, error: 'not_found' },
        )
      }),
    ]
    return () => {
      for (const unregister of unregisters) unregister()
    }
  }, [fw, mobile, dock])

  return null
}
