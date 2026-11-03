import { useState } from 'react'
import Countdown from './Countdown.jsx'
import FrogGrad from './FrogGrad.jsx'
import inviteImg from '../assets/grad-invite.jpg'
import campusImg from '../assets/unnamed.webp'
import { track } from '../utils/track.js'
import { fillPronouns, pronounsFor } from '../utils/pronouns.js'

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

// Each "no" click shows the next line and grows the "yes" button; the "no" button disappears after the last one
// {you}/{me} are filled from the guest's name (anh/chị/em... or bạn by default)
const NO_TEXTS = [
  'Rất tiếc, không thể',
  '{You} chắc chưa? 🥺',
  'Suy nghĩ lại đi mà...',
  '{Me} năn nỉ đó 😢',
  'Một lần cả đời thôi!',
  'Không đến là {me} buồn lắm á 😭',
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

function Rsvp({ guest, pronouns }) {
  const [accepted, setAccepted] = useState(false)
  const [noCount, setNoCount] = useState(0)
  const t = (text) => fillPronouns(text, pronouns)

  return (
    <section className="rsvp no-print no-capture">
      <p className="rsvp-title">{t('{You} sẽ đến chứ?')}</p>
      {accepted ? (
        <p className="rsvp-thanks">
          💛 Yayyy! Cảm ơn {guest || pronouns.you}! {t('Hẹn gặp {you} tại buổi lễ nhé!')}
          {noCount > 0 && <span className="rsvp-tease">{t('Biết ngay là {you} sẽ đến mà 😆')}</span>}
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
            {t('{Self} sẽ đến 💛')}
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
              {t(NO_TEXTS[noCount])}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

// interactive=false hides the RSVP buttons (used on the host's /taothiep preview)
export default function InvitationCard({ info, guest, interactive = true }) {
  const { weekday, day, month, year } = formatDate(info.date)
  const pronouns = pronounsFor(guest)
  const messageLines = fillPronouns(info.message, pronouns).split(/(?<=[.!?])\s+/)

  return (
    <article className="card">
      <div className="card-border">
        {/* A real element (not ::before) so html-to-image embeds it in the downloaded picture */}
        <div className="card-watermark" style={{ backgroundImage: `url(${campusImg})` }} aria-hidden="true" />
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />

        {/* Two columns on wide screens (invite + photo | details), stacked on phones */}
        <div className="card-left">
          <header className="card-header">
            <div className="cap">🎓</div>
            <p className="eyebrow">Thân mời</p>
            <p className="guest">{guest || 'Bạn'}</p>
            <p className="eyebrow">đến dự lễ tốt nghiệp của</p>
          </header>

          <figure className="photo-arch">
            <img src={inviteImg} alt={info.graduateName} />
            <span className="photo-medal" aria-hidden="true">
              <FrogGrad size={38} />
            </span>
          </figure>
        </div>

        <div className="card-right">
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
              <a className="map-link no-capture" href={info.mapUrl} target="_blank" rel="noreferrer">
                📍 Xem bản đồ
              </a>
            )}
          </section>

          <Countdown date={info.date} time={info.time} endTime={info.endTime} />

          {/* one sentence per line, so the quote wraps the same on the page and in the downloaded picture */}
          <blockquote className="message">
            {messageLines.map((sentence, i) => (
              <span key={i} className="message-line">
                {i === 0 && '“'}
                {sentence}
                {i === messageLines.length - 1 && '”'}
              </span>
            ))}
          </blockquote>

          {interactive && <Rsvp guest={guest} pronouns={pronouns} />}

          <footer className="card-footer">
            <p className="signature">{info.graduateName}</p>
            {info.phone && <p className="phone">Liên hệ: {info.phone}</p>}
          </footer>
        </div>
      </div>
    </article>
  )
}
