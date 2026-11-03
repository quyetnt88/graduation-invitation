import { useState } from 'react'
import Envelope from './components/Envelope.jsx'
import InvitationCard from './components/InvitationCard.jsx'
import Confetti from './components/Confetti.jsx'
import SideCannons from './components/SideCannons.jsx'
import { defaultInfo } from './data/defaultInfo.js'
import { track } from './utils/track.js'
import envelopeBg from './assets/fptu.jpg'
import cardBg from './assets/unnamed.webp'
import './App.css'

// Guest page: enter a name on the envelope, then see the invitation and RSVP
export default function App() {
  const [guest, setGuest] = useState(() => new URLSearchParams(window.location.search).get('to') || '')
  const [opened, setOpened] = useState(false)

  return (
    <div className="app" style={{ '--bg-image': `url(${opened ? cardBg : envelopeBg})` }}>
      <div className="stars" aria-hidden="true" />

      {!opened ? (
        <Envelope
          guest={guest}
          sender={defaultInfo.graduateName.split(' ').at(-1)}
          info={defaultInfo}
          onGuestChange={setGuest}
          onOpen={() => {
            track('open', { name: guest.trim() })
            setOpened(true)
          }}
        />
      ) : (
        <>
          <Confetti />
          <SideCannons />
          <main className="stage">
            <div className="card-capture">
              <InvitationCard info={defaultInfo} guest={guest} />
            </div>
            <button className="close-btn" onClick={() => setOpened(false)}>
              ✉️ Đóng thiệp
            </button>
          </main>
        </>
      )}
    </div>
  )
}
