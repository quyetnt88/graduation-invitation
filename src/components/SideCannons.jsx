import { useEffect, useRef, useState } from 'react'

// Every few seconds, two "party cannons" fire confetti and graduation caps from the bottom corners
const INTERVAL_MS = 2000
const LIFETIME_MS = 2600
const PIECES_PER_SIDE = 14
const COLORS = ['#d4af37', '#f3e5ab', '#ffffff', '#c9a227', '#8fb3ff', '#b3262e']
const EMOJIS = ['🎓', '🎓', '🐸', '📜', '⭐', '🎉']

const rand = (min, max) => min + Math.random() * (max - min)

function makeBurst(id) {
  const pieces = []
  for (const side of ['left', 'right']) {
    for (let i = 0; i < PIECES_PER_SIDE; i++) {
      const dx = rand(18, 48) * (side === 'left' ? 1 : -1)
      pieces.push({
        key: `${id}-${side}-${i}`,
        side,
        emoji: i < 2 ? EMOJIS[Math.floor(Math.random() * EMOJIS.length)] : null,
        style: {
          '--dx': `${dx}vw`,
          '--dy': `${-rand(45, 85)}vh`,
          '--spin': `${rand(-540, 540)}deg`,
          '--size': `${rand(6, 11)}px`,
          background: COLORS[i % COLORS.length],
          animationDuration: `${rand(1.8, LIFETIME_MS / 1000)}s`,
          animationDelay: `${rand(0, 0.15)}s`,
        },
      })
    }
  }
  return { id, pieces }
}

export default function SideCannons() {
  const [bursts, setBursts] = useState([])
  // Kept across effect re-runs (StrictMode) so burst keys never repeat
  const nextId = useRef(0)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const fire = () => {
      if (document.hidden) return
      const burst = makeBurst(nextId.current++)
      setBursts((list) => [...list, burst])
      setTimeout(() => setBursts((list) => list.filter((b) => b.id !== burst.id)), LIFETIME_MS + 300)
    }

    fire()
    const id = setInterval(fire, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="cannons no-print" aria-hidden="true">
      {bursts.flatMap((b) =>
        b.pieces.map((p) => (
          <span key={p.key} className={`cannon-piece ${p.side} ${p.emoji ? 'emoji' : ''}`} style={p.style}>
            {p.emoji}
          </span>
        )),
      )}
    </div>
  )
}
