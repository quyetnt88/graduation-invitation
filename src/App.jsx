import { useRef, useState } from 'react'
import Envelope from './components/Envelope.jsx'
import InvitationCard from './components/InvitationCard.jsx'
import Confetti from './components/Confetti.jsx'
import SideCannons from './components/SideCannons.jsx'
import { defaultInfo } from './data/defaultInfo.js'
import { track } from './utils/track.js'
import { downloadCard } from './utils/downloadCard.js'
import envelopeBg from './assets/fptu.jpg'
import cardBg from './assets/unnamed.webp'
import './App.css'

// Guest page: enter a name on the envelope, then see the invitation and RSVP
export default function App() {
  const [guest, setGuest] = useState(() => new URLSearchParams(window.location.search).get('to') || '')
  const [opened, setOpened] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const captureRef = useRef(null)

  const handleDownload = async () => {
    if (!captureRef.current || saving) return
    setSaving(true)
    setError('')
    try {
      await downloadCard(captureRef.current, guest.trim())
    } catch {
      setError('Tải ảnh chưa được, bạn thử lại giúp mình nha 🙏')
    } finally {
      setSaving(false)
    }
  }

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
            <div className="guest-actions no-print">
              <button className="close-btn download-btn" onClick={handleDownload} disabled={saving}>
                {saving ? '⏳ Đang tạo ảnh...' : '📥 Tải thiệp về máy'}
              </button>
              <button className="close-btn" onClick={() => setOpened(false)}>
                ✉️ Đóng thiệp
              </button>
              {error && <p className="share-error">{error}</p>}
            </div>
          </main>

          {/* Always-wide copy for the download, so phones also get the landscape picture */}
          <div className="capture-offscreen" aria-hidden="true">
            <div ref={captureRef} className="card-capture">
              <InvitationCard info={defaultInfo} guest={guest} interactive={false} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
