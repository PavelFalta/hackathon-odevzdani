import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AdminAnalytics, UsageMetrics } from '../../api/admin'
import { fetchAdminAnalytics } from '../../api/admin'
import { AdminShell } from './AdminShell'
import { AdminUsageFilters } from './AdminUsageFilters'

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    username: 'admin',
    role: 'admin',
    loading: false,
    logout: vi.fn(),
    login: vi.fn(),
  }),
}))

vi.mock('../../api/admin', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/admin')>()
  return { ...actual, fetchAdminAnalytics: vi.fn() }
})

function metrics(overrides: Partial<UsageMetrics> = {}): UsageMetrics {
  return {
    tool_calls: 0,
    mapbox_calls: 0,
    openai_events: 0,
    input_tokens: 0,
    output_tokens: 0,
    event_count: 0,
    ...overrides,
  }
}

function payload(overrides: Partial<AdminAnalytics> = {}): AdminAnalytics {
  return {
    period: '30d',
    from: '2026-09-10T00:00:00.000Z',
    to: '2026-10-10T00:00:00.000Z',
    username_filter: null,
    usernames: ['alice', 'bob'],
    totals: metrics({ event_count: 12, tool_calls: 4 }),
    by_user: [
      { username: 'alice', ...metrics({ event_count: 10, tool_calls: 3 }) },
      { username: 'bob', ...metrics({ event_count: 2, tool_calls: 1 }) },
    ],
    daily: [],
    by_category: [],
    top_tools: [],
    ...overrides,
  }
}

function cardValue(label: string) {
  const item = screen.getByText(label).closest('.admin-cards__item')
  if (!item) throw new Error(`card ${label} missing`)
  return item.querySelector('.admin-cards__value')
}

describe('AdminShell analytics filters', () => {
  beforeEach(() => {
    vi.mocked(fetchAdminAnalytics).mockReset()
  })

  it('refetches on period and user change and hides other table rows', async () => {
    vi.mocked(fetchAdminAnalytics)
      .mockResolvedValueOnce(payload())
      .mockResolvedValueOnce(
        payload({
          period: '7d',
          totals: metrics({ event_count: 3, tool_calls: 1 }),
        }),
      )
      .mockResolvedValueOnce(
        payload({
          period: '7d',
          username_filter: 'alice',
          totals: metrics({ event_count: 99, tool_calls: 8 }),
          by_user: [
            { username: 'alice', ...metrics({ event_count: 99, tool_calls: 8 }) },
            { username: 'bob', ...metrics({ event_count: 0 }) },
          ],
        }),
      )

    const user = userEvent.setup()
    render(<AdminShell />)

    const table = await screen.findByRole('table')
    expect(within(table).getByText('alice')).toBeInTheDocument()
    expect(within(table).getByText('bob')).toBeInTheDocument()
    expect(cardValue('Záznamů celkem')).toHaveTextContent('12')

    await user.selectOptions(screen.getByLabelText('Období'), '7d')
    await waitFor(() =>
      expect(fetchAdminAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: '7d', username: undefined }),
      ),
    )
    await waitFor(() => expect(cardValue('Záznamů celkem')).toHaveTextContent('3'))

    await user.selectOptions(screen.getByLabelText('Uživatel'), 'alice')
    await waitFor(() =>
      expect(fetchAdminAnalytics).toHaveBeenLastCalledWith(
        expect.objectContaining({ period: '7d', username: 'alice' }),
      ),
    )
    await waitFor(() => {
      expect(cardValue('Záznamů celkem')).toHaveTextContent('99')
      const filtered = screen.getByRole('table')
      expect(within(filtered).getByText('alice')).toBeInTheDocument()
      expect(within(filtered).queryByText('bob')).not.toBeInTheDocument()
    })
  })
})

describe('AdminUsageFilters', () => {
  it('notifies period and username changes and shows custom dates', async () => {
    const user = userEvent.setup()
    const onPeriodChange = vi.fn()
    const onUsernameChange = vi.fn()
    const { rerender } = render(
      <AdminUsageFilters
        period="30d"
        from="2026-01-01"
        to="2026-01-31"
        username=""
        usernames={['alice']}
        onPeriodChange={onPeriodChange}
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
        onUsernameChange={onUsernameChange}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Období'), '7d')
    expect(onPeriodChange).toHaveBeenCalledWith('7d')
    await user.selectOptions(screen.getByLabelText('Uživatel'), 'alice')
    expect(onUsernameChange).toHaveBeenCalledWith('alice')

    rerender(
      <AdminUsageFilters
        period="custom"
        from="2026-01-01"
        to="2026-01-31"
        username=""
        usernames={['alice']}
        onPeriodChange={onPeriodChange}
        onFromChange={vi.fn()}
        onToChange={vi.fn()}
        onUsernameChange={onUsernameChange}
      />,
    )
    expect(screen.getByLabelText('Od')).toHaveValue('2026-01-01')
    expect(screen.getByLabelText('Do')).toHaveValue('2026-01-31')
  })
})
