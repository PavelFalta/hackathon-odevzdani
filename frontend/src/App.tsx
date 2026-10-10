import { LoginScreen } from './features/auth/LoginScreen'
import { useAuth } from './features/auth/AuthContext'
import { AdminShell } from './features/admin/AdminShell'
import { MapWorkspace } from './features/map/MapWorkspace'
import { AppShell } from './features/shell/AppShell'
import './App.css'

function AppRoutes() {
  const { username, role, loading } = useAuth()
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN

  if (loading) {
    return <p className="app-loading">Ověřování přihlášení…</p>
  }

  const authenticated = Boolean(username)
  const isAdmin = role === 'admin'

  if (authenticated && isAdmin) {
    return <AdminShell />
  }

  if (!mapboxToken) {
    if (!authenticated) return <LoginScreen />
    return <AppShell />
  }

  return (
    <MapWorkspace authenticated={authenticated}>
      {!authenticated ? <LoginScreen /> : <AppShell />}
    </MapWorkspace>
  )
}

export default function App() {
  return <AppRoutes />
}
