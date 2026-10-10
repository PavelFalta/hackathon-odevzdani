import { useState } from 'react'
import { BrowserReviewsAgentBridge } from '../assistant/agent/BrowserReviewsAgentBridge'
import { FloatingWindowsAgentBridge } from '../assistant/agent/FloatingWindowsAgentBridge'
import { FloatingWindowsProvider } from '../floating-windows/FloatingWindowsContext'
import { AssistantProvider } from '../assistant/AssistantContext'
import { AssistantHub } from '../assistant/AssistantHub'
import { BrowserEmulatorProvider } from '../browser-emulator/BrowserEmulatorContext'
import { FloatingBrowserEmulator } from '../browser-emulator/FloatingBrowserEmulator'
import { NavigationProvider } from '../navigation/NavigationContext'
import { FloatingNavigationPanel } from '../navigation/FloatingNavigationPanel'
import { NavigationAgentBridge } from '../assistant/agent/NavigationAgentBridge'
import { TimetableAgentBridge } from '../assistant/agent/TimetableAgentBridge'
import { TimetableProvider } from '../timetable/TimetableContext'
import { FloatingTimetablePanel } from '../timetable/FloatingTimetablePanel'
import { NavigationMapBridge } from '../navigation/NavigationMapBridge'
import { NavigationWorkspaceBridge } from '../navigation/NavigationWorkspaceBridge'
import { PlacePhotosProvider } from '../reviews/PlacePhotosContext'
import { ReviewsProvider } from '../reviews/ReviewsContext'
import { FloatingPlacePhotosPanel } from '../reviews/FloatingPlacePhotosPanel'
import { FloatingReviewsPanel } from '../reviews/FloatingReviewsPanel'
import { KairosWordmark } from '../auth/KairosWordmark'
import { LoginAppLogo3d } from '../auth/LoginAppLogo3d'
import { useAuth } from '../auth/AuthContext'
import { ProfilePanel } from '../profile/ProfilePanel'
import { MapView } from '../map/MapView'
import { UserLocationProvider } from '../map/userLocation/UserLocationContext'
import { MobileDockProvider } from './MobileDockContext'
import { ShellDock } from './ShellDock'
import { ShellMapInsetBridge } from './ShellMapInsetBridge'
import './shell.css'
import './shell-mobile.css'

export function AppShell() {
  const { username, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <UserLocationProvider>
      <div className="shell">
        <header className="shell-header">
          <div className="shell-brand">
            <LoginAppLogo3d className="shell-header-logo" interactiveSpin={false} />
            <KairosWordmark />
          </div>
          <div className="shell-meta">
            <span className="shell-pill">uživatel · {username}</span>
            <button type="button" className="shell-logout" onClick={logout}>
              Ukončit relaci
            </button>
          </div>
        </header>
        <main className="shell-main">
          <MobileDockProvider>
            <FloatingWindowsProvider>
              <BrowserEmulatorProvider>
                <TimetableProvider>
                  <ReviewsProvider>
                    <PlacePhotosProvider>
                      <NavigationProvider>
                        <ShellMapInsetBridge />
                        <BrowserReviewsAgentBridge />
                        <NavigationAgentBridge />
                        <TimetableAgentBridge />
                        <NavigationMapBridge />
                        <NavigationWorkspaceBridge />
                        <FloatingWindowsAgentBridge />
                        <AssistantProvider>
                          <div className="shell-map-stage">
                            <MapView className="map-shell map-shell--full" />
                            <AssistantHub onOpenProfile={() => setProfileOpen(true)} />
                          </div>
                          <ShellDock />
                        </AssistantProvider>
                        <FloatingReviewsPanel />
                        <FloatingPlacePhotosPanel />
                        <FloatingNavigationPanel />
                        <FloatingBrowserEmulator />
                        <FloatingTimetablePanel />
                      </NavigationProvider>
                    </PlacePhotosProvider>
                  </ReviewsProvider>
                </TimetableProvider>
              </BrowserEmulatorProvider>
            </FloatingWindowsProvider>
          </MobileDockProvider>
        </main>
        {profileOpen ? <ProfilePanel onClose={() => setProfileOpen(false)} /> : null}
      </div>
    </UserLocationProvider>
  )
}
