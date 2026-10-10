import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './features/auth/AuthContext'
import App from './App'

vi.mock('./features/shaders/ShaderBackdrop', () => ({
  ShaderBackdrop: () => null,
}))

function renderApp() {
  return render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  )
}

describe('App', () => {
  it('shows login when logged out', async () => {
    renderApp()
    expect(await screen.findByRole('heading', { name: /^kairos$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /přihlásit se/i })).toBeInTheDocument()
  })
})
