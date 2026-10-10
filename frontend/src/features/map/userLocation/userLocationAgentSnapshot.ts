import type { UserLocationFix, UserLocationInputReason } from './userLocationTypes'

export type UserLocationAgentSnapshot = {
  has_fix: boolean
  resolving: boolean
  source: UserLocationFix['source'] | null
  label: string | null
  lon: number | null
  lat: number | null
  auto_resolve_hint: UserLocationInputReason | null
}

export function buildUserLocationAgentSnapshot(input: {
  fix: UserLocationFix | null
  resolving: boolean
  autoResolveHint: UserLocationInputReason | null
}): UserLocationAgentSnapshot {
  const { fix, resolving, autoResolveHint } = input
  return {
    has_fix: fix !== null,
    resolving,
    source: fix?.source ?? null,
    label: fix?.label ?? null,
    lon: fix?.lon ?? null,
    lat: fix?.lat ?? null,
    auto_resolve_hint: fix ? null : autoResolveHint,
  }
}
