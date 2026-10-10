const DEFAULT_CALLS_URL = 'https://api.openai.com/v1/realtime/calls'

export function realtimeCallsUrl(): string {
  const fromEnv = import.meta.env.VITE_OPENAI_REALTIME_CALLS_URL
  return typeof fromEnv === 'string' && fromEnv.trim() ? fromEnv.trim() : DEFAULT_CALLS_URL
}
