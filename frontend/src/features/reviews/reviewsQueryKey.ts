/** Case- and accent-insensitive key for matching review panels to the same place. */
export function reviewsQueryKey(query: string): string {
  return query.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ')
}
