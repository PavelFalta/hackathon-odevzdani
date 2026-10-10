import { barHeight, chartMax } from './adminChartMath'

type Row = {
  label: string
  count: number
}

type Props = {
  title: string
  rows: Row[]
  emptyHint: string
}

export function AdminUsageBreakdownChart({ title, rows, emptyHint }: Props) {
  const max = chartMax(rows.map((r) => r.count))

  return (
    <div className="admin-breakdown">
      <h2 className="admin-panel__title">{title}</h2>
      {rows.length === 0 ? (
        <p className="admin-shell__hint">{emptyHint}</p>
      ) : (
        <ul className="admin-breakdown__list">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="admin-breakdown__row">
                <span className="admin-breakdown__label">{row.label}</span>
                <span className="admin-breakdown__count">{row.count}</span>
              </div>
              <div className="admin-breakdown__track">
                <div
                  className="admin-breakdown__bar"
                  style={{ width: `${barHeight(row.count, max, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
