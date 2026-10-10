import { useMemo, useState } from 'react'
import type { AdminPeriod } from '../../api/admin'
import { KairosWordmark } from '../auth/KairosWordmark'
import { useAuth } from '../auth/AuthContext'
import '../shell/shell.css'
import { AdminUsageBreakdownChart } from './AdminUsageBreakdownChart'
import { AdminUsageFilters } from './AdminUsageFilters'
import { AdminUsageSummaryCards } from './AdminUsageSummaryCards'
import { AdminUsageTrendChart } from './AdminUsageTrendChart'
import { AdminUserUsageTable } from './AdminUserUsageTable'
import { AdminTokenTrendChart } from './AdminTokenTrendChart'
import { defaultCustomRange, formatAdminRange } from './adminPeriod'
import { useAdminAnalytics } from './useAdminAnalytics'
import './admin.css'

export function AdminShell() {
  const { username, logout } = useAuth()
  const [period, setPeriod] = useState<AdminPeriod>('30d')
  const customDefault = useMemo(() => defaultCustomRange(), [])
  const [from, setFrom] = useState(customDefault.from)
  const [to, setTo] = useState(customDefault.to)
  const [userFilter, setUserFilter] = useState('')

  const params = useMemo(
    () => ({
      period,
      from: period === 'custom' ? from : undefined,
      to: period === 'custom' ? to : undefined,
      username: userFilter || undefined,
    }),
    [period, from, to, userFilter],
  )

  const { data, error, loading } = useAdminAnalytics(params)
  const usernames = data?.usernames ?? []
  const tableRows =
    data && userFilter
      ? data.by_user.filter((row) => row.username === userFilter)
      : (data?.by_user ?? [])

  return (
    <div className="shell admin-shell">
      <header className="shell-header">
        <div className="shell-brand">
          <KairosWordmark />
          <span className="admin-shell__tag">administrace</span>
        </div>
        <div className="shell-meta">
          <span className="shell-pill">admin · {username}</span>
          <button type="button" className="shell-logout" onClick={logout}>
            Ukončit relaci
          </button>
        </div>
      </header>
      <main className="admin-shell__main">
        <header className="admin-shell__intro">
          <div>
            <h1 className="admin-shell__title">Analytika využití</h1>
            <p className="admin-shell__hint">
              Nástroje, Mapbox a OpenAI Realtime — souhrny, trendy a rozpad podle uživatelů.
            </p>
            {data ? (
              <p className="admin-shell__range">{formatAdminRange(data.from, data.to)}</p>
            ) : null}
          </div>
          <AdminUsageFilters
            period={period}
            from={from}
            to={to}
            username={userFilter}
            usernames={usernames}
            onPeriodChange={setPeriod}
            onFromChange={setFrom}
            onToChange={setTo}
            onUsernameChange={setUserFilter}
          />
        </header>

        {error ? <p className="admin-shell__error">{error}</p> : null}
        {loading && !data ? <p className="admin-shell__hint">Načítám data…</p> : null}

        {data ? (
          <>
            <AdminUsageSummaryCards totals={data.totals} />
            <div className="admin-grid">
              <section className="admin-panel admin-panel--wide">
                <h2 className="admin-panel__title">Aktivita podle dne</h2>
                <AdminUsageTrendChart daily={data.daily} />
              </section>
              <section className="admin-panel">
                <AdminTokenTrendChart daily={data.daily} />
              </section>
              <section className="admin-panel">
                <AdminUsageBreakdownChart
                  title="Kategorie"
                  rows={data.by_category.map((r) => ({ label: r.category, count: r.count }))}
                  emptyHint="V tomto období zatím nic."
                />
              </section>
              <section className="admin-panel">
                <AdminUsageBreakdownChart
                  title="Nejpoužívanější nástroje"
                  rows={data.top_tools.map((r) => ({ label: r.label, count: r.count }))}
                  emptyHint="Zatím žádná volání nástrojů."
                />
              </section>
            </div>
            <section className="admin-panel admin-panel--table">
              <h2 className="admin-panel__title">Rozpad podle uživatele</h2>
              <AdminUserUsageTable rows={tableRows} />
              {tableRows.length === 0 ? (
                <p className="admin-shell__hint">Žádní uživatelé v tomto filtru.</p>
              ) : null}
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}
