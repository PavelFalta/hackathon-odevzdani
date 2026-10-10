import { useEffect, useState } from 'react'
import { MAP_BOOT_QUOTE_MS, mapBootQuoteAt } from './mapBootQuotes'

export function useBootQuote(active: boolean) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setIndex((current) => current + 1), MAP_BOOT_QUOTE_MS)
    return () => window.clearInterval(id)
  }, [active])

  return mapBootQuoteAt(index)
}
