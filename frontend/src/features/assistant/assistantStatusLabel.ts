export function assistantStatusLabel(status: string): string {
  if (status === 'connecting') return 'Připojování…'
  if (status === 'ready') return 'Připojeno'
  if (status === 'error') return 'Nedostupné'
  return 'Spouštění…'
}
