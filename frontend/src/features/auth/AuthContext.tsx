import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, login as apiLogin, type UserRole } from '../../api/auth'
import { setAuthToken } from '../../api/client'

const STORAGE_KEY = 'posledni_token'

type AuthState = {
  username: string | null
  role: UserRole | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(() => readStoredToken() !== null)

  useEffect(() => {
    const saved = readStoredToken()
    if (!saved) return
    setAuthToken(saved)
    fetchMe()
      .then((me) => {
        setUsername(me.username)
        setRole(me.role)
      })
      .catch(() => {
        sessionStorage.removeItem(STORAGE_KEY)
        setAuthToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (user: string, password: string) => {
    const res = await apiLogin(user, password)
    sessionStorage.setItem(STORAGE_KEY, res.access_token)
    setAuthToken(res.access_token)
    setUsername(res.username)
    setRole(res.role)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    setUsername(null)
    setRole(null)
  }, [])

  const value = useMemo(
    () => ({ username, role, loading, login, logout }),
    [username, role, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
