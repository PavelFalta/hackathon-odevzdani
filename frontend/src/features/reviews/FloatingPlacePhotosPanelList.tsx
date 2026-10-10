import type { PlacePhotosPanelData } from './PlacePhotosContext'
import { PlacePhotosPanelInstance } from './PlacePhotosPanelInstance'

type FloatingPlacePhotosPanelListProps = {
  panels: PlacePhotosPanelData[]
}

export function FloatingPlacePhotosPanelList({ panels }: FloatingPlacePhotosPanelListProps) {
  return (
    <>
      {panels.map((panel) => (
        <PlacePhotosPanelInstance key={panel.id} panel={panel} />
      ))}
    </>
  )
}
