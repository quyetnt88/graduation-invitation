import { useEffect, useRef, useState } from 'react'
import { containsProfanity } from '../utils/profanity.js'

const PROFANITY_MESSAGES = [
  '🚨 Hệ thống phát hiện từ ngữ hơi "mặn"! Bạn nhập lại tên thật giúp mình nhé 😊',
  '🙈 Ơ, thiệp VIP chưa nhận được tên này rồi. Bạn thử lại giúp mình nha!',
  '🌸 Tên đẹp thì thiệp mới mở nè, bạn nhập lại giúp mình nhé 😄',
]

// Fake "security check" shown before the envelope opens
const SCAN_STEPS = [
  { icon: '🔍', text: 'Đang quét khuôn mặt...' },
  { icon: '📋', text: 'Đang đối chiếu danh sách khách mời...' },
  { icon: '🎉', text: 'Đang trải thảm đỏ chào đón bạn...' },
]
const STEP_MS = 1100

export default function Envelope({ guest, onGuestChange, onOpen }) {
  const [step, setStep] = useState(-1)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [badTries, setBadTries] = useState(0)
  const inputRef = useRef(null)
  const scanning = step >= 0
  const verified = step >= SCAN_STEPS.length

  useEffect(() => {
    if (!scanning) return
    const id = setTimeout(() => {
      if (verified) onOpen()
      else setStep((s) => s + 1)
    }, verified ? 1600 : STEP_MS)
    return () => clearTimeout(id)
  }, [step, scanning, verified, onOpen])

  const reject = (message) => {
    setError(message)
    setShake(true)
    inputRef.current?.focus()
    setTimeout(() => setShake(false), 500)
  }

  const startScan = () => {
    if (scanning) return
    const name = guest.trim()
    if (!name) return reject('Bạn chưa nhập tên nên hệ thống chưa xác minh được nè 🤔')
    if (name.length > 40) return reject('Tên dài quá nè 😅 Bạn rút gọn dưới 40 ký tự giúp mình nha.')
    if (containsProfanity(name)) {
      reject(PROFANITY_MESSAGES[badTries % PROFANITY_MESSAGES.length])
      setBadTries((n) => n + 1)
      return
    }
    setError('')
    setStep(0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    startScan()
  }

  return (
    <div className="envelope-screen">
      <p className="secret-badge">🔒 Thiệp tuyệt mật · Chỉ dành cho khách VIP</p>

      <button className={`envelope ${scanning ? 'is-scanning' : ''}`} onClick={startScan} aria-label="Mở thiệp">
        <div className="envelope-flap" />
        <div className="envelope-body">
          <div className="seal">{verified ? '✅' : '🎓'}</div>
        </div>
        {scanning && !verified && <div className="scan-line" />}
      </button>

      {!scanning ? (
        <>
          <form className={`guest-form ${shake ? 'shake' : ''}`} onSubmit={handleSubmit}>
            <label htmlFor="guest-name">Xác minh danh tính: tên bạn là...</label>
            <input
              id="guest-name"
              ref={inputRef}
              value={guest}
              onChange={(e) => {
                onGuestChange(e.target.value)
                setError('')
              }}
              placeholder="Nhập tên thật nha, hệ thống biết hết đó 👀"
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
              Xác minh &amp; mở khóa 🔓
            </button>
          </form>
          <p className="envelope-hint">Hệ thống sẽ kiểm tra bạn có trong danh sách khách mời không 🕵️</p>
        </>
      ) : (
        <div className="scan-panel" role="status" aria-live="polite">
          {SCAN_STEPS.slice(0, Math.min(step + 1, SCAN_STEPS.length)).map((s, i) => (
            <p key={s.text} className={`scan-step ${i < step ? 'done' : ''}`}>
              <span>{i < step ? '✔️' : s.icon}</span> {s.text}
            </p>
          ))}
          {verified && (
            <p className="scan-verified">
              ✅ Xác nhận: <strong>{guest.trim()}</strong> là khách VIP!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
