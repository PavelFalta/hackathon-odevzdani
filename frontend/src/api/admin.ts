import { getJson } from './client'

export type UsageMetrics = {
  tool_calls: number
  mapbox_calls: number
  openai_events: number
  input_tokens: number
  output_tokens: number
  event_count: number
}

export type UserUsageSummary = UsageMetrics & {
  username: string
}

export type AdminPeriod = '7d' | '30d' | '90d' | 'this_month' | 'last_month' | 'all' | 'custom'

export type DailyUsagePoint = UsageMetrics & {
  date: string
}

export type CategoryBreakdown = {
  category: string
  count: number
}

export type ToolBreakdown = {
  label: string
  count: number
}

export type AdminAnalytics = {
  period: AdminPeriod
  from: string
  to: string
  username_filter: string | null
  usernames: string[]
  totals: UsageMetrics
  by_user: UserUsageSummary[]
  daily: DailyUsagePoint[]
  by_category: CategoryBreakdown[]
  top_tools: ToolBreakdown[]
}

export type AdminAnalyticsParams = {
  period: AdminPeriod
  from?: string
  to?: string
  username?: string
}

export async function fetchAdminUsage(): Promise<UserUsageSummary[]> {
  return getJson('/api/admin/usage')
}

export async function fetchAdminAnalytics(params: AdminAnalyticsParams): Promise<AdminAnalytics> {
  const search = new URLSearchParams()
  search.set('period', params.period)
  if (params.username) search.set('username', params.username)
  if (params.period === 'custom') {
    if (params.from) search.set('from', params.from)
    if (params.to) search.set('to', params.to)
  }
  const query = search.toString()
  return getJson(`/api/admin/analytics${query ? `?${query}` : ''}`)
}
