import { describe, expect, it } from 'vitest'
import { agentActionsRef } from '../agent/agentActionsRef'
import { runAgentTool } from './runAgentTool'

describe('runAgentTool', () => {
  it('returns error for unknown tools', async () => {
    const out = JSON.parse(await runAgentTool('missing_tool', '{}')) as { error: string }
    expect(out.error).toBe('unknown_tool')
  })

  it('delegates set_map_time when map action is registered', async () => {
    agentActionsRef.current.setMapTime = async (hour, minute) =>
      JSON.stringify({ ok: true, hour, minute })
    const out = JSON.parse(
      await runAgentTool('set_map_time', JSON.stringify({ time: '20:30' })),
    ) as { ok: boolean; hour: number; minute: number }
    expect(out.ok).toBe(true)
    expect(out.hour).toBe(20)
    expect(out.minute).toBe(30)
    delete agentActionsRef.current.setMapTime
  })

  it('fills the timetable from show_timetable', async () => {
    agentActionsRef.current.showTimetable = async (argumentsJson) => argumentsJson
    const out = await runAgentTool('show_timetable', JSON.stringify({ title: 'Víkend', days: [] }))
    expect(out).toContain('Víkend')
    delete agentActionsRef.current.showTimetable
  })

  it('delegates fly_to_place when map action is registered', async () => {
    agentActionsRef.current.flyToPlace = async (lon, lat) => JSON.stringify({ ok: true, lon, lat })
    const out = JSON.parse(
      await runAgentTool('fly_to_place', JSON.stringify({ lon: 12.87, lat: 50.23 })),
    ) as { ok: boolean }
    expect(out.ok).toBe(true)
    delete agentActionsRef.current.flyToPlace
  })
})
