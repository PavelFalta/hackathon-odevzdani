import { getJson } from './client'

export type EmbedCheckResponse = {
  embeddable: boolean
  reason: string | null
}

export async function fetchEmbedCheck(url: string): Promise<EmbedCheckResponse> {
  const params = new URLSearchParams({
    url,
    ancestor: window.location.origin,
  })
  return getJson<EmbedCheckResponse>(`/api/browser/embed-check?${params.toString()}`)
}

export type BrowserHtmlResponse = {
  html: string
  final_url: string
}

export async function fetchBrowserHtml(url: string): Promise<BrowserHtmlResponse> {
  const params = new URLSearchParams({ url })
  return getJson<BrowserHtmlResponse>(`/api/browser/html?${params.toString()}`)
}
