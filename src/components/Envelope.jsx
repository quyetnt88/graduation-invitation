import { useEffect, useRef, useState } from 'react'
import { containsProfanity } from '../utils/profanity.js'
import FrogGrad from './FrogGrad.jsx'

const PROFANITY_MESSAGES = [
  '🚨 Hệ thống phát hiện từ ngữ hơi "mặn"! Bạn nhập lại tên thật giúp mình nhé 😊',
  '🙈 Ơ, thiệp chưa nhận được tên này rồi. Bạn thử lại giúp mình nha!',
  '🌸 Tên đẹp thì thiệp mới mở nè, bạn nhập lại giúp mình nhé 😄',
]

// Placeholder rotates through these while the input is empty
const PLACEHOLDERS = [
  'Tên bạn là gì nè? 👀',
  'VD: Bạn thân nhất của Quyết',
  'VD: Người hay cho chép bài',
  'VD: Đồng đội chạy deadline',
]
const PLACEHOLDER_MS = 2500

// "📅 Thứ Bảy, 07.11.2026 · Đại học FPT"
function formatEventLine(date, venue) {
  const d = new Date(`${date}T00:00`)
  if (Number.isNaN(d.getTime())) return ''
  const weekday = d.toLocaleDateString('vi-VN', { weekday: 'long' })
  const day = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  return `📅 ${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day}${venue ? ` · ${venue}` : ''}`
}

export default function Envelope({ guest, sender, info, onGuestChange, onOpen }) {
  const year = info.date.slice(0, 4)
  const eventLine = formatEventLine(info.date, info.venue)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [badTries, setBadTries] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (guest) return
    const id = setInterval(() => setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length), PLACEHOLDER_MS)
    return () => clearInterval(id)
  }, [guest])

  const reject = (message) => {
    setError(message)
    setShake(true)
    inputRef.current?.focus()
    setTimeout(() => setShake(false), 500)
  }

  const tryOpen = () => {
    const name = guest.trim()
    if (!name) return reject('Bạn nhập tên trước rồi mở thiệp nha 🤔')
    if (name.length > 40) return reject('Tên dài quá nè 😅 Bạn rút gọn còn tối đa 40 ký tự giúp mình nha.')
    if (containsProfanity(name)) {
      reject(PROFANITY_MESSAGES[badTries % PROFANITY_MESSAGES.length])
      setBadTries((n) => n + 1)
      return
    }
    onOpen()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    tryOpen()
  }

  return (
    <div className="envelope-screen">
      <p className="event-badge">🎓 Lễ Tốt Nghiệp · Class of {year}</p>

      <button className="envelope" onClick={tryOpen} aria-label="Mở thiệp">
        <div className="envelope-flap" />
        <div className="envelope-body">
          <div className="seal wiggle">
            <FrogGrad size={44} />
          </div>
        </div>
        <span className="grad-stamp" aria-hidden="true">
          <span className="grad-stamp-icon">🎓</span>
          <span className="grad-stamp-year">{year}</span>
        </span>
        {sender && <span className="envelope-sender">Từ: Tân cử nhân {sender} 🎓</span>}
      </button>

      <form className={`guest-form ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
        <label htmlFor="guest-name">Thiệp này gửi đến...</label>
        <input
          id="guest-name"
          ref={inputRef}
          value={guest}
          onChange={(e) => {
            onGuestChange(e.target.value)
            setError('')
          }}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          autoComplete="off"
          maxLength={60}
          aria-invalid={!!error}
          aria-describedby={error ? 'guest-error' : undefined}
          className={error ? 'invalid' : ''}
        />
        {error && (
          <p id="guest-error" className="guest-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-gold">
          Mở thiệp 💌
        </button>
      </form>
      {eventLine && <p className="envelope-hint">{eventLine}</p>}
    </div>
  )
}
