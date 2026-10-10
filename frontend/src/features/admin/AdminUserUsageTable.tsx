import type { UserUsageSummary } from '../../api/admin'

type Props = {
  rows: UserUsageSummary[]
}

export function AdminUserUsageTable({ rows }: Props) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Uživatel</th>
          <th>Nástroje</th>
          <th>Mapbox</th>
          <th>OpenAI</th>
          <th>Tokeny in</th>
          <th>Tokeny out</th>
          <th>Záznamů</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.username}>
            <td>{row.username}</td>
            <td>{row.tool_calls}</td>
            <td>{row.mapbox_calls}</td>
            <td>{row.openai_events}</td>
            <td>{row.input_tokens}</td>
            <td>{row.output_tokens}</td>
            <td>{row.event_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
