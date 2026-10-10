import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider } from './AuthContext'
import { LoginScreen } from './LoginScreen'

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
}))

vi.mock('../shaders/ShaderBackdrop', () => ({
  ShaderBackdrop: () => null,
}))

vi.mock('./LoginAppLogo3d', () => ({
  LoginAppLogo3d: () => null,
}))

import { login as apiLogin } from '../../api/auth'

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.mocked(apiLogin).mockReset()
  })

  it('submits credentials to the auth API', async () => {
    vi.mocked(apiLogin).mockResolvedValue({
      access_token: 'tok',
      token_type: 'bearer',
      username: 'demo',
      role: 'user',
    })
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>,
    )
    await user.type(screen.getByLabelText(/heslo/i), 'demo123')
    await user.click(screen.getByRole('button', { name: /přihlásit se/i }))
    expect(apiLogin).toHaveBeenCalledWith('demo', 'demo123')
  })
})
