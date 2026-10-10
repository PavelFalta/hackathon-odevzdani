import { normalizeBrowserUrl } from './normalizeBrowserUrl'

function urlIdentity(href: string): string | null {
  const normalized = normalizeBrowserUrl(href)
  if (!normalized) return null
  try {
    const u = new URL(normalized)
    const path = u.pathname.replace(/\/$/, '') || '/'
    return `${u.protocol}//${u.host.toLowerCase()}${path}${u.search}`
  } catch {
    return null
  }
}

export function browserUrlsMatch(a: string, b: string): boolean {
  const ka = urlIdentity(a)
  const kb = urlIdentity(b)
  return ka !== null && kb !== null && ka === kb
}
