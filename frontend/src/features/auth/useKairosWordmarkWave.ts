import { useEffect, useState } from 'react'
import { KAIROS_WORDMARK_WAVE_MS, pickKairosWaveDelayMs } from './kairosWordmarkWaveSchedule'

export function useKairosWordmarkWave(): boolean {
  const [waving, setWaving] = useState(false)

  useEffect(() => {
    let waitId: ReturnType<typeof setTimeout> | undefined
    let endId: ReturnType<typeof setTimeout> | undefined

    const arm = () => {
      waitId = setTimeout(() => {
        setWaving(true)
        endId = setTimeout(() => {
          setWaving(false)
          arm()
        }, KAIROS_WORDMARK_WAVE_MS)
      }, pickKairosWaveDelayMs())
    }

    arm()
    return () => {
      if (waitId !== undefined) clearTimeout(waitId)
      if (endId !== undefined) clearTimeout(endId)
    }
  }, [])

  return waving
}
