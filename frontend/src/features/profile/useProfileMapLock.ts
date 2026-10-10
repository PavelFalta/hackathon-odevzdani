import { useEffect } from 'react'
import {
  resumeMapForFloatingPanelDrag,
  suspendMapForFloatingPanelDrag,
} from '../map/mapFloatingPanelDragGuard'

export function useProfileMapLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    suspendMapForFloatingPanelDrag()
    document.body.dataset.profileOpen = 'true'
    return () => {
      resumeMapForFloatingPanelDrag()
      delete document.body.dataset.profileOpen
    }
  }, [active])
}
