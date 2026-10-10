import { useCallback, useState } from 'react'
import { markAssistantMenuTouched, readAssistantMenuTouched } from './assistantMenuSessionHint'

export function useAssistantMenuSessionHint() {
  const [showHint, setShowHint] = useState(() => !readAssistantMenuTouched())

  const markTouched = useCallback(() => {
    if (!showHint) return
    markAssistantMenuTouched()
    setShowHint(false)
  }, [showHint])

  return { showHint, markTouched }
}
