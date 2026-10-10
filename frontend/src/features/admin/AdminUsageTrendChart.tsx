import type { DailyUsagePoint } from '../../api/admin'
import { chartMax, linePath } from './adminChartMath'

const SERIES = [
  { key: 'tool_calls' as const, label: 'Nástroje', color: 'var(--kairos-cyan)' },
  { key: 'mapbox_calls' as const, label: 'Mapbox', color: 'var(--kairos-cyan-dim)' },
  { key: 'openai_events' as const, label: 'OpenAI', color: 'var(--kairos-link)' },
]

type Props = {
  daily: DailyUsagePoint[]
}

export function AdminUsageTrendChart({ daily }: Props) {
  const width = 640
  const height = 220
  const padding = 28
  const max = chartMax(
    daily.flatMap((row) => SERIES.map((s) => row[s.key])),
    1,
  )

  const ticks =
    daily.length <= 14 ? daily : daily.filter((_, i) => i % Math.ceil(daily.length / 10) === 0)

  return (
    <div className="admin-chart">
      <div className="admin-chart__legend">
        {SERIES.map((s) => (
          <span key={s.key} className="admin-chart__legend-item">
            <span className="admin-chart__swatch" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg
        className="admin-chart__svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Denní trend využití"
      >
        {[0, 0.5, 1].map((t) => {
          const y = padding + (height - padding * 2) * t
          return (
            <line
              key={t}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              className="admin-chart__grid"
            />
          )
        })}
        {SERIES.map((s) => (
          <path
            key={s.key}
            d={linePath(
              daily.map((row) => row[s.key]),
              width,
              height,
              padding,
              max,
            )}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
          />
        ))}
      </svg>
      <div className="admin-chart__axis">
        {ticks.map((row) => (
          <span key={row.date}>{row.date.slice(5)}</span>
        ))}
      </div>
    </div>
  )
}
