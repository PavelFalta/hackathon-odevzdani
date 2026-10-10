import { splitPlaceMarkup } from './assistantPlaceMarkup'
import { goToPlaceOnMap } from './assistantGoToPlace'

type AssistantMessageContentProps = {
  content: string
}

export function AssistantMessageContent({ content }: AssistantMessageContentProps) {
  const parts = splitPlaceMarkup(content)
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.value}</span>
        }
        return (
          <button
            key={index}
            type="button"
            className="assistant-place-link"
            title="Zobrazit na mapě"
            onClick={() => void goToPlaceOnMap(part.lon, part.lat, part.label)}
          >
            {part.label}
          </button>
        )
      })}
    </>
  )
}
