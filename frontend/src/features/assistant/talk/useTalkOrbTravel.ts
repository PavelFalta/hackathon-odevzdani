import { useEffect, useRef } from 'react'
import { MOBILE_SHELL_MEDIA } from '../../shell/mobileShell'
import {
  useFloatingWindowsActions,
  useFloatingWindowsState,
} from '../../floating-windows/floatingWindowsHooks'
import { pickTalkOrbTravelTarget } from './talkOrbTravelSlots'

function isMobileShell(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_SHELL_MEDIA).matches
}

export function useTalkOrbTravel(
  enabled: boolean,
  orbId: string,
  toolActive: boolean,
  toolActivity: string | null,
  voiceTurnId: number,
): void {
  const actions = useFloatingWindowsActions()
  const windows = useFloatingWindowsState()
  const windowsRef = useRef(windows)
  windowsRef.current = windows
  const traveledTurnRef = useRef(-1)
  const lastActivityRef = useRef<string | null>(null)

  useEffect(() => {
    lastActivityRef.current = null
  }, [voiceTurnId])

  useEffect(() => {
    if (isMobileShell()) return
    if (!enabled || !toolActive || !toolActivity) return
    if (toolActivity === lastActivityRef.current) return
    lastActivityRef.current = toolActivity
    if (traveledTurnRef.current === voiceTurnId) return
    traveledTurnRef.current = voiceTurnId

    const list = windowsRef.current
    const self = list.find((w) => w.id === orbId)
    if (!self) return

    const obstacles = list.filter((w) => w.id !== orbId).map((w) => w.rect)
    const target = pickTalkOrbTravelTarget(self.rect, obstacles)
    if (!target) return
    if (Math.hypot(target.x - self.rect.x, target.y - self.rect.y) < 6) return

    actions.travelTo(orbId, target)
  }, [actions, enabled, orbId, toolActive, toolActivity, voiceTurnId])
}
