import { useState } from 'react'
import { releaseAgentPlaceOrbit } from '../map/mapPlaceOrbit'
import { useMapController } from '../map/MapContext'
import { AssistantActionMenu } from './AssistantActionMenu'
import { useAssistant } from './AssistantContext'
import { AssistantMapPlacesBridge } from './agent/AssistantMapPlacesBridge'
import { FloatingAssistantChat } from './FloatingAssistantChat'
import { FloatingAssistantTalk } from './FloatingAssistantTalk'
import './assistant-hub.css'

type AssistantHubProps = {
  onOpenProfile: () => void
}

export function AssistantHub({ onOpenProfile }: AssistantHubProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [talkOpen, setTalkOpen] = useState(false)
  const { busy } = useAssistant()
  const { phase } = useMapController()
  const showMenu = !chatOpen && !talkOpen && phase !== 'loading'

  const closeChat = () => {
    releaseAgentPlaceOrbit()
    setChatOpen(false)
  }

  const closeTalk = () => {
    releaseAgentPlaceOrbit()
    setTalkOpen(false)
  }

  return (
    <div
      className="assistant-hub"
      data-chat-open={chatOpen ? 'true' : 'false'}
      data-talk-open={talkOpen ? 'true' : 'false'}
    >
      {showMenu ? (
        <AssistantActionMenu
          busy={busy}
          onChat={() => setChatOpen(true)}
          onTalk={() => setTalkOpen(true)}
          onProfil={onOpenProfile}
        />
      ) : null}
      <AssistantMapPlacesBridge />
      <FloatingAssistantChat open={chatOpen} onClose={closeChat} />
      <FloatingAssistantTalk open={talkOpen} onClose={closeTalk} />
    </div>
  )
}
