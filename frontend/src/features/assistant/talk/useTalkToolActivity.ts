import { useCallback, useState } from 'react'

export function useTalkToolActivity() {
  const [toolActivity, setToolActivity] = useState<string | null>(null)
  const [toolActive, setToolActive] = useState(false)

  const onToolActivity = useCallback((label: string) => {
    setToolActivity(label)
    setToolActive(true)
  }, [])

  const clearToolActivity = useCallback(() => {
    setToolActivity(null)
    setToolActive(false)
  }, [])

  return { toolActivity, toolActive, onToolActivity, clearToolActivity }
}
