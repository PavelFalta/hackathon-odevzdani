/** Document height for panel sizing (same-origin blob/proxy only). Does not mutate the page. */
export function measureIframeDocumentHeight(iframe: HTMLIFrameElement): number | null {
  try {
    const doc = iframe.contentDocument
    if (!doc) return null
    const root = doc.documentElement
    const body = doc.body
    return Math.max(
      root.scrollHeight,
      root.offsetHeight,
      body?.scrollHeight ?? 0,
      body?.offsetHeight ?? 0,
    )
  } catch {
    return null
  }
}
