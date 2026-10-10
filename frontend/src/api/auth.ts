import { getJson, postJson } from './client'

export type UserRole = 'user' | 'admin'

export type LoginResponse = {
  access_token: string
  token_type: string
  username: string
  role: UserRole
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  return postJson<LoginResponse>('/api/auth/login', { username, password })
}

export async function fetchMe(): Promise<{ username: string; role: UserRole }> {
  return getJson('/api/auth/me')
}
