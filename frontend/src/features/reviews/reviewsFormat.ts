export function formatRatingCs(value: number | null): string {
  if (value == null) return '—'
  return value.toFixed(1).replace('.', ',')
}

export function formatReviewCount(count: number): string {
  return `${count.toLocaleString('cs-CZ')} hodnocení`
}

export function formatReviewDate(value: string | null): string {
  if (!value) return ''
  const parsed = Date.parse(value)
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
  return value
}
