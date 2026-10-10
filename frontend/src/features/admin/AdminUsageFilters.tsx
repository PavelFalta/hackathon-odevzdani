import type { AdminPeriod } from '../../api/admin'
import { ADMIN_PERIOD_OPTIONS } from './adminPeriod'

type Props = {
  period: AdminPeriod
  from: string
  to: string
  username: string
  usernames: string[]
  onPeriodChange: (period: AdminPeriod) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onUsernameChange: (value: string) => void
}

export function AdminUsageFilters({
  period,
  from,
  to,
  username,
  usernames,
  onPeriodChange,
  onFromChange,
  onToChange,
  onUsernameChange,
}: Props) {
  return (
    <div className="admin-filters">
      <label className="admin-filters__field">
        <span>Období</span>
        <select value={period} onChange={(e) => onPeriodChange(e.target.value as AdminPeriod)}>
          {ADMIN_PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      {period === 'custom' ? (
        <>
          <label className="admin-filters__field">
            <span>Od</span>
            <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} />
          </label>
          <label className="admin-filters__field">
            <span>Do</span>
            <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} />
          </label>
        </>
      ) : null}
      <label className="admin-filters__field">
        <span>Uživatel</span>
        <select value={username} onChange={(e) => onUsernameChange(e.target.value)}>
          <option value="">Všichni uživatelé</option>
          {usernames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
