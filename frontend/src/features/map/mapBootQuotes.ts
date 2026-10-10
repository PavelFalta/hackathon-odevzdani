export const MAP_BOOT_QUOTES = [
  'Inicializace vykreslování mapy.',
  'Stahování vektorových dlaždic.',
  'Sestavování sítě terénu.',
  'Použití masky regionu.',
  'Zahřívání mezipaměti dlaždic.',
  'Kalibrace hranic zobrazení.',
] as const

export const MAP_BOOT_QUOTE_MS = 3400

export function mapBootQuoteAt(index: number) {
  const count = MAP_BOOT_QUOTES.length
  const wrapped = ((index % count) + count) % count
  return MAP_BOOT_QUOTES[wrapped]
}
