import { startSlowAutoScroll } from './slowAutoScroll'

/** Slow scroll inside the iframe document (same-origin blob/proxy only). */
export function startIframeAutoScroll(iframe: HTMLIFrameElement): () => void {
  try {
    const doc = iframe.contentDocument
    if (!doc) return () => {}
    const el = (doc.scrollingElement ?? doc.documentElement) as HTMLElement
    const panel = iframe.closest('.browser-emulator')
    const stopOnPointerDown: EventTarget[] = [el, doc, iframe]
    if (panel) stopOnPointerDown.push(panel)
    return startSlowAutoScroll(el, { stopOnPointerDown })
  } catch {
    return () => {}
  }
}
