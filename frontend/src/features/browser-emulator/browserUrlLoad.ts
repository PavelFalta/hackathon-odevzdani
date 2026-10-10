import { fetchBrowserHtml, fetchEmbedCheck } from '../../api/browser'
import { parseViewportContentWidth } from './browserContentWidth'
import { createBrowserFrameBlobUrl } from './browserFrameBlob'
import { normalizeBrowserUrl } from './normalizeBrowserUrl'
import type { LoadUrlResult } from './useBrowserEmulatorLoad'

export type BrowserLoadPayload = {
  activeUrl: string
  frameSrc: string
  blobUrl?: string
  contentWidth?: number | null
}

export async function loadBrowserUrl(
  url: string,
): Promise<LoadUrlResult & { payload?: BrowserLoadPayload }> {
  const normalized = normalizeBrowserUrl(url)
  if (!normalized) {
    return { ok: false, reason: 'Neplatná adresa URL', code: 'invalid_url' }
  }

  try {
    try {
      const proxied = await fetchBrowserHtml(normalized)
      const blobUrl = createBrowserFrameBlobUrl(proxied.html)
      return {
        ok: true,
        payload: {
          activeUrl: normalized,
          frameSrc: blobUrl,
          blobUrl,
          contentWidth: parseViewportContentWidth(proxied.html),
        },
      }
    } catch {
      /* try direct iframe */
    }

    const result = await fetchEmbedCheck(normalized)
    if (!result.embeddable) {
      return {
        ok: false,
        reason: result.reason ?? 'Tuto stránku nelze zobrazit v náhledu.',
        code: 'not_displayable',
      }
    }
    return {
      ok: true,
      payload: { activeUrl: normalized, frameSrc: normalized, contentWidth: null },
    }
  } catch {
    return {
      ok: false,
      reason: 'Nepodařilo se načíst náhled stránky.',
      code: 'fetch_failed',
    }
  }
}
