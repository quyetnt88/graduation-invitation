import { useState } from 'react'
import Envelope from './components/Envelope.jsx'
import InvitationCard from './components/InvitationCard.jsx'
import Confetti from './components/Confetti.jsx'
import { defaultInfo } from './data/defaultInfo.js'
import { track } from './utils/track.js'
import './App.css'

export default function App() {
  const [guest, setGuest] = useState(() => new URLSearchParams(window.location.search).get('to') || '')
  const [opened, setOpened] = useState(false)

  return (
    <div className="app">
      <div className="stars" aria-hidden="true" />

      {!opened ? (
        <Envelope
          guest={guest}
          sender={defaultInfo.graduateName.split(' ').at(-1)}
          onGuestChange={setGuest}
          onOpen={() => {
            track('open', { name: guest.trim() })
            setOpened(true)
          }}
        />
      ) : (
        <>
          <Confetti />
          <main className="stage">
            <InvitationCard info={defaultInfo} guest={guest} />
            <button className="close-btn" onClick={() => setOpened(false)}>
              ✉️ Đóng thiệp
            </button>
          </main>
        </>
      )}
    </div>
  )
}
