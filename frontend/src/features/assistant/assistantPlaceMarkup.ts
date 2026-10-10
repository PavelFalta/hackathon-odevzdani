/** Map link syntax: [[Place name;;longitude;;latitude]] — stored in message text for history. */
const PLACE_LINK_RE = /\[\[([^[\]]+);;(-?\d+(?:\.\d+)?);;(-?\d+(?:\.\d+)?)\]\]/g

export type PlaceMarkupPart =
  { type: 'text'; value: string } | { type: 'place'; label: string; lon: number; lat: number }

export function splitPlaceMarkup(content: string): PlaceMarkupPart[] {
  const parts: PlaceMarkupPart[] = []
  let lastIndex = 0
  for (const match of content.matchAll(PLACE_LINK_RE)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, index) })
    }
    parts.push({
      type: 'place',
      label: match[1].trim(),
      lon: Number(match[2]),
      lat: Number(match[3]),
    })
    lastIndex = index + match[0].length
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }
  return parts.length > 0 ? parts : [{ type: 'text', value: content }]
}

export function firstPlaceInMarkup(
  content: string,
): { label: string; lon: number; lat: number } | null {
  const links = extractPlaceLinks(content)
  return links[0] ?? null
}

export function extractPlaceLinks(
  content: string,
): Array<{ label: string; lon: number; lat: number }> {
  return splitPlaceMarkup(content)
    .filter((part) => part.type === 'place')
    .map((part) => ({
      label: part.label,
      lon: part.lon,
      lat: part.lat,
    }))
}
