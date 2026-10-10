import { useState, type FormEvent } from 'react'
import { ShaderBackdrop } from '../shaders/ShaderBackdrop'
import { useAuth } from './AuthContext'
import { KairosWordmark } from './KairosWordmark'
import { LoginAppLogo3d } from './LoginAppLogo3d'
import './login.css'

export function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(username.trim(), password)
    } catch {
      setError('Přístup odepřen. Zkontroluj přihlašovací údaje.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-root">
      <ShaderBackdrop buildingHover />
      <div className="login-stack">
        <LoginAppLogo3d className="login-app-logo" />
        <main className="login-panel">
          <KairosWordmark />
          <form className="login-form" onSubmit={onSubmit}>
            <label className="login-label-plain">
              uživatel
              <input
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label htmlFor="login-passphrase">
              Heslo
              <input
                id="login-passphrase"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error ? (
              <p className="login-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" disabled={busy || !password}>
              {busy ? 'Ověřování…' : 'Přihlásit se'}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
