import type { AdminPeriod } from '../../api/admin'

export const ADMIN_PERIOD_OPTIONS: { value: AdminPeriod; label: string }[] = [
  { value: '7d', label: 'Posledních 7 dní' },
  { value: '30d', label: 'Posledních 30 dní' },
  { value: '90d', label: 'Posledních 90 dní' },
  { value: 'this_month', label: 'Tento měsíc' },
  { value: 'last_month', label: 'Minulý měsíc' },
  { value: 'all', label: 'Celá historie' },
  { value: 'custom', label: 'Vlastní rozsah' },
]

export function formatAdminRange(fromIso: string, toIso: string): string {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  const fmt = (d: Date) =>
    d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${fmt(from)} – ${fmt(to)}`
}

export function defaultCustomRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date()
  from.setDate(to.getDate() - 29)
  return { from: toInputDate(from), to: toInputDate(to) }
}

export function toInputDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
