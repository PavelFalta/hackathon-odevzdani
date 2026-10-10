import { describe, expect, it } from 'vitest'
import { orderToolCallsForExecution } from './orderToolCalls'
import type { RealtimeOutputItem } from './realtimeTypes'

function call(name: string, callId: string): RealtimeOutputItem {
  return { type: 'function_call', name, call_id: callId, arguments: '{}' }
}

describe('orderToolCallsForExecution', () => {
  it('runs open_google_maps_route before export_route_map_screenshot', () => {
    const ordered = orderToolCallsForExecution([
      call('export_route_map_screenshot', 'c1'),
      call('open_google_maps_route', 'c2'),
    ])
    expect(ordered.map((c) => c.name)).toEqual([
      'open_google_maps_route',
      'export_route_map_screenshot',
    ])
  })
})
