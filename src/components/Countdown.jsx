import { useEffect, useState } from 'react'

function getRemaining(target) {
  const diff = Math.max(0, target - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  }
}

export default function Countdown({ date, time, endTime }) {
  const target = new Date(`${date}T${time || '00:00'}`).getTime()
  const end = new Date(`${date}T${endTime || '23:59'}`).getTime()
  const [left, setLeft] = useState(() => getRemaining(target))

  useEffect(() => {
    setLeft(getRemaining(target))
    const id = setInterval(() => setLeft(getRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (Number.isNaN(target)) return null
  // During the ceremony vs. after it, so the card never keeps saying "today" once the day has passed
  if (left.done) {
    const over = Date.now() > end
    return (
      <p className="countdown-done no-capture">
        {over ? '💛 Cảm ơn mọi người đã đến chung vui!' : '🎉 Buổi lễ đang diễn ra, hẹn gặp nhau nhé!'}
      </p>
    )
  }

  const units = [
    ['Ngày', left.days],
    ['Giờ', left.hours],
    ['Phút', left.minutes],
    ['Giây', left.seconds],
  ]

  return (
    <div className="countdown no-capture">
      {units.map(([label, value]) => (
        <div className="countdown-item" key={label}>
          <span className="countdown-value">{String(value).padStart(2, '0')}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
