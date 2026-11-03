import { useRef, useState } from 'react'
import InvitationCard from '../components/InvitationCard.jsx'
import ShareBar from '../components/ShareBar.jsx'
import { defaultInfo } from '../data/defaultInfo.js'
import { containsProfanity } from '../utils/profanity.js'
import cardBg from '../assets/unnamed.webp'
import '../App.css'

// Host page (/taothiep): type a guest's name, preview the card, then copy the link or download the image.
// Nothing here is tracked, so making cards doesn't show up on /thongke.
export default function HostPage() {
  const [guest, setGuest] = useState('')
  const cardRef = useRef(null)
  const name = guest.trim()
  const problem = name.length > 40 ? 'Tên tối đa 40 ký tự' : containsProfanity(name) ? 'Tên có từ không phù hợp' : ''

  return (
    <div className="app" style={{ '--bg-image': `url(${cardBg})` }}>
      <main className="stage host-stage">
        <section className="host-panel no-print">
          <h1>💌 Tạo thiệp cho khách</h1>
          <label htmlFor="host-guest">Tên khách mời</label>
          <input
            id="host-guest"
            value={guest}
            onChange={(e) => setGuest(e.target.value)}
            placeholder="VD: Chị Lan"
            maxLength={60}
            autoComplete="off"
            autoFocus
          />
          {problem && <p className="host-error">{problem}</p>}
          {name && !problem ? (
            <ShareBar guest={name} cardRef={cardRef} />
          ) : (
            <p className="host-hint">Nhập tên để copy link hoặc tải ảnh thiệp</p>
          )}
        </section>

        <div className="card-capture">
          <InvitationCard info={defaultInfo} guest={name} interactive={false} />
        </div>
      </main>

      {/* Always-wide copy for the download, so phones also get the landscape picture */}
      <div className="capture-offscreen" aria-hidden="true">
        <div ref={cardRef} className="card-capture">
          <InvitationCard info={defaultInfo} guest={name} interactive={false} />
        </div>
      </div>
    </div>
  )
}
