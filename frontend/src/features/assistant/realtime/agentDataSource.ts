export type AgentDataSourceKind = 'open_data' | 'online'

export type AgentDataSource = {
  kind: AgentDataSourceKind
  /** Short Czech sentence the model may repeat to the user. */
  disclosure_cs: string | null
}

export const OPEN_DATA_DISCLOSURE =
  'Informace beru z otevřených dat Karlovarského kraje (datazapad.cz).'

export const ONLINE_DISCLOSURE = 'Údaje jsem dohledal online.'

export function openDataSource(hasUsableHits: boolean): AgentDataSource {
  return {
    kind: 'open_data',
    disclosure_cs: hasUsableHits ? OPEN_DATA_DISCLOSURE : null,
  }
}

export function onlineDataSource(hasUsableHits: boolean): AgentDataSource {
  return {
    kind: 'online',
    disclosure_cs: hasUsableHits ? ONLINE_DISCLOSURE : null,
  }
}
