import { FloatingPlacePhotosPanelList } from './FloatingPlacePhotosPanelList'
import { usePlacePhotos } from './PlacePhotosContext'

export function FloatingPlacePhotosPanel() {
  const { panels } = usePlacePhotos()
  return <FloatingPlacePhotosPanelList panels={panels} />
}
