import { searchWeb } from '../../../api/webSearch'

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function runWebSearchTool(argumentsJson: string): Promise<string> {
  const args = parseJson<{ query?: string; when?: string }>(argumentsJson)
  const query = args?.query?.trim()
  if (!query) return JSON.stringify({ ok: false, error: 'query_required' })
  try {
    const result = await searchWeb(query, args?.when?.trim() || undefined)
    return JSON.stringify(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'web_search_failed'
    return JSON.stringify({ ok: false, error: 'web_search_failed', message })
  }
}
