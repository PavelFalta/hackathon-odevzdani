import type { DailyUsagePoint } from '../../api/admin'
import { barHeight, chartMax } from './adminChartMath'

type Props = {
  daily: DailyUsagePoint[]
}

export function AdminTokenTrendChart({ daily }: Props) {
  const max = chartMax(daily.map((d) => d.input_tokens + d.output_tokens))
  const innerH = 100

  return (
    <div className="admin-chart admin-chart--tokens">
      <h2 className="admin-panel__title">Tokeny podle dne</h2>
      <div className="admin-token-bars">
        {daily.map((row) => {
          const inH = barHeight(row.input_tokens, max, innerH)
          const outH = barHeight(row.output_tokens, max, innerH)
          return (
            <div key={row.date} className="admin-token-bars__col" title={row.date}>
              <div className="admin-token-bars__stack" style={{ height: innerH }}>
                <div className="admin-token-bars__in" style={{ height: inH }} />
                <div className="admin-token-bars__out" style={{ height: outH }} />
              </div>
              {daily.length <= 16 ? (
                <span className="admin-token-bars__tick">{row.date.slice(8)}</span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="admin-chart__legend">
        <span className="admin-chart__legend-item">
          <span className="admin-chart__swatch admin-chart__swatch--in" />
          Input
        </span>
        <span className="admin-chart__legend-item">
          <span className="admin-chart__swatch admin-chart__swatch--out" />
          Output
        </span>
      </div>
    </div>
  )
}
