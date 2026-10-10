import { postJson } from './client'

export type WebSearchEvent = {
  date: string
  time: string | null
  title: string
  place: string | null
  url: string | null
}

export type WebSearchResponse = {
  ok: boolean
  summary: string
  events: WebSearchEvent[]
  data_source: { kind: string; disclosure_cs: string }
}

export function searchWeb(query: string, when?: string): Promise<WebSearchResponse> {
  return postJson<WebSearchResponse>(
    '/api/assistant/web-search',
    { query, when: when || null },
    true,
  )
}
