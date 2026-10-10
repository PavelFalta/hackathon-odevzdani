import { useEffect, useState } from 'react'

export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(hover: none)').matches : false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(hover: none)')
    const sync = () => setCoarse(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return coarse
}
