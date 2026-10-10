export type RealtimeServerEvent = {
  type: string
  event_id?: string
  delta?: string
  response?: RealtimeResponsePayload
  error?: { message?: string; code?: string; type?: string }
}

export type RealtimeResponsePayload = {
  status?: string
  output?: RealtimeOutputItem[]
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
}

export type RealtimeOutputItem = {
  type?: string
  name?: string
  call_id?: string
  arguments?: string
}

export type RealtimeDataChannel = {
  send: (data: string) => void
  readyState: string
  addEventListener: (type: 'message' | 'open', listener: (event: Event) => void) => void
  removeEventListener: (type: 'message' | 'open', listener: (event: Event) => void) => void
  close: () => void
}

export type RealtimePeer = {
  close: () => void
  iceGatheringState: string
  addEventListener: (type: 'icegatheringstatechange', listener: () => void) => void
  removeEventListener: (type: 'icegatheringstatechange', listener: () => void) => void
}
