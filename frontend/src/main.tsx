import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './features/auth/AuthContext'
import './theme/variables.css'
import './theme/mobile-form-zoom.css'
import './theme/kairos-floating-panel.css'
import './theme/kairos-scrollbar.css'
import './index.css'
import App from './App.tsx'

/** After a deploy, cached index.html may reference removed chunks — reload once. */
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
