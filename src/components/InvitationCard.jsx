import { useState } from 'react'
import Countdown from './Countdown.jsx'
import inviteImg from '../assets/grad-invite.jpg'
import { track } from '../utils/track.js'

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

// Each "no" click shows the next line and grows the "yes" button; the "no" button disappears after the last one
const NO_TEXTS = [
  'Rất tiếc, không thể',
  'Bạn chắc chưa? 🥺',
  'Suy nghĩ lại đi mà...',
  'Năn nỉ đó 😢',
  'Một lần cả đời thôi!',
  'Không đến là buồn lắm á 😭',
  'Bấm nút kia đi mà 👉',
]

function formatDate(date) {
  const d = new Date(`${date}T00:00`)
  if (Number.isNaN(d.getTime())) return { weekday: '', day: '--', month: '--', year: '----' }
  return {
    weekday: WEEKDAYS[d.getDay()],
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: d.getFullYear(),
  }
}

export default function InvitationCard({ info, guest }) {
  const [accepted, setAccepted] = useState(false)
  const [noCount, setNoCount] = useState(0)
  const { weekday, day, month, year } = formatDate(info.date)

  return (
    <article className="card">
      <div className="card-border">
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />

        <header className="card-header">
          <div className="cap">🎓</div>
          <p className="eyebrow">Trân trọng kính mời</p>
          <p className="guest">{guest || 'Bạn'}</p>
          <p className="eyebrow">đến dự lễ tốt nghiệp của</p>
        </header>

        <figure className="photo-arch">
          <img src={inviteImg} alt={info.graduateName} />
          <figcaption>Chính bạn đó! 👉</figcaption>
        </figure>

        <h1 className="graduate-name">{info.graduateName}</h1>
        <p className="school">{info.school}</p>

        <div className="divider">
          <span>✦</span>
        </div>

        <section className="date-block">
          <div className="date-side">{weekday}</div>
          <div className="date-main">
            <span className="date-day">{day}</span>
            <span className="date-rest">
              Tháng {month}
              <br />
              {year}
            </span>
          </div>
          <div className="date-side">
            {info.time}
            {info.endTime && (
              <>
                <br />– {info.endTime}
              </>
            )}
          </div>
        </section>

        <section className="venue">
          <p className="venue-name">{info.venue}</p>
          <p className="venue-address">{info.address}</p>
          {info.mapUrl && (
            <a className="map-link" href={info.mapUrl} target="_blank" rel="noreferrer">
              📍 Xem bản đồ
            </a>
          )}
        </section>

        <Countdown date={info.date} time={info.time} />

        <blockquote className="message">“{info.message}”</blockquote>

        <section className="rsvp no-print">
          <p className="rsvp-title">Bạn sẽ đến chứ?</p>
          {accepted ? (
            <p className="rsvp-thanks">
              💛 Yayyy! Cảm ơn {guest || 'bạn'}! Hẹn gặp bạn tại buổi lễ nhé!
              {noCount > 0 && <span className="rsvp-tease">Biết ngay là bạn sẽ đến mà 😆</span>}
            </p>
          ) : (
            <div className="rsvp-actions">
              <button
                className="btn btn-gold btn-yes"
                style={{ fontSize: `${0.9 + noCount * 0.35}rem`, padding: `${10 + noCount * 4}px ${20 + noCount * 8}px` }}
                onClick={() => {
                  setAccepted(true)
                  track('yes', { noCount })
                }}
              >
                Mình sẽ đến 💛
              </button>
              {noCount < NO_TEXTS.length && (
                <button
                  key={noCount}
                  className="btn btn-outline btn-no"
                  style={{ fontSize: `${Math.max(0.55, 0.9 - noCount * 0.05)}rem` }}
                  onClick={() => {
                    setNoCount(noCount + 1)
                    track('no', { noCount: noCount + 1 })
                  }}
                >
                  {NO_TEXTS[noCount]}
                </button>
              )}
            </div>
          )}
        </section>

        <footer className="card-footer">
          <p className="signature">{info.graduateName}</p>
          {info.phone && <p className="phone">Liên hệ: {info.phone}</p>}
        </footer>
      </div>
    </article>
  )
}
