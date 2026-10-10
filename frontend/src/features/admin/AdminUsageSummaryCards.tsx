import type { UsageMetrics } from '../../api/admin'

const CARDS: { key: keyof UsageMetrics; label: string }[] = [
  { key: 'tool_calls', label: 'Volání nástrojů' },
  { key: 'mapbox_calls', label: 'Mapbox' },
  { key: 'openai_events', label: 'OpenAI události' },
  { key: 'input_tokens', label: 'Tokeny in' },
  { key: 'output_tokens', label: 'Tokeny out' },
  { key: 'event_count', label: 'Záznamů celkem' },
]

type Props = {
  totals: UsageMetrics
}

export function AdminUsageSummaryCards({ totals }: Props) {
  return (
    <div className="admin-cards">
      {CARDS.map((card) => (
        <div key={card.key} className="admin-cards__item">
          <span className="admin-cards__label">{card.label}</span>
          <span className="admin-cards__value">{totals[card.key].toLocaleString('cs-CZ')}</span>
        </div>
      ))}
    </div>
  )
}
