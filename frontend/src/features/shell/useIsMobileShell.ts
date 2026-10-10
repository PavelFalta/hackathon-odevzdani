import { useEffect, useState } from 'react'
import { MOBILE_SHELL_MEDIA } from './mobileShell'

export function useIsMobileShell(): boolean {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(MOBILE_SHELL_MEDIA).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_SHELL_MEDIA)
    const sync = () => setMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return mobile
}
