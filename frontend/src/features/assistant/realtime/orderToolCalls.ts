import type { RealtimeOutputItem } from './realtimeTypes'

/** Runs before async tools so popup blockers do not swallow Google Maps tabs. */
const TOOL_EXECUTION_PRIORITY: Record<string, number> = {
  open_google_maps_route: 0,
  plan_route: 10,
  export_route_steps: 20,
  export_route_map_screenshot: 30,
}

function toolPriority(name: string | undefined): number {
  if (!name) return 50
  return TOOL_EXECUTION_PRIORITY[name] ?? 50
}

export function orderToolCallsForExecution(calls: RealtimeOutputItem[]): RealtimeOutputItem[] {
  return [...calls].sort((a, b) => toolPriority(a.name) - toolPriority(b.name))
}
