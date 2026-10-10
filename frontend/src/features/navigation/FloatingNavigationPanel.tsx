import { NavigationPanelInstance } from './NavigationPanelInstance'
import { useNavigation } from './NavigationContext'
import './navigation-panel.css'

export function FloatingNavigationPanel() {
  const { panels } = useNavigation()
  return (
    <>
      {panels.map((panel) => (
        <NavigationPanelInstance key={panel.id} panel={panel} />
      ))}
    </>
  )
}
