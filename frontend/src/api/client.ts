const base = import.meta.env.VITE_API_BASE_URL ?? ''

let authToken: string | null = null
let conversationId: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export function setConversationId(id: string | null) {
  conversationId = id
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  if (authToken) headers.Authorization = `Bearer ${authToken}`
  if (conversationId) headers['X-Kairos-Conversation-Id'] = conversationId
  return headers
}

async function errorMessageFromResponse(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { detail?: unknown }
    if (typeof data.detail === 'string') return data.detail
  } catch {
    /* not JSON */
  }
  return `Požadavek selhal: ${response.status}`
}

export async function postJson<T>(path: string, body: unknown, auth = false): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response))
  }
  return response.json() as Promise<T>
}

export async function getJson<T>(path: string, auth = true): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    headers: auth ? authHeaders() : {},
  })
  if (!response.ok) {
    throw new Error(`Požadavek selhal: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function getBlob(path: string, auth = true): Promise<Blob> {
  const response = await fetch(`${base}${path}`, {
    headers: auth ? authHeaders() : {},
  })
  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response))
  }
  return response.blob()
}
