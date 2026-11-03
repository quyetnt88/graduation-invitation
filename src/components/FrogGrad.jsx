// A little gold frog wearing a graduation cap, drawn to match the card's gold/navy palette.
// Solid fills only (no gradient ids) so several copies on a page and the downloaded image all render the same.
const GOLD = '#d9b24a'
const GOLD_DARK = '#8a6a14'
const NAVY = '#0b1d3a'
const CREAM = '#fffaf0'

export default function FrogGrad({ size = 32, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Chú cóc tốt nghiệp"
    >
      {/* eye bumps, then the head drawn over their lower half */}
      <circle cx="20" cy="30" r="8" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1.5" />
      <circle cx="44" cy="30" r="8" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1.5" />
      <ellipse cx="32" cy="43" rx="23" ry="16" fill={GOLD} stroke={GOLD_DARK} strokeWidth="1.5" />

      {/* eyes */}
      <circle cx="20" cy="30" r="5.5" fill={CREAM} />
      <circle cx="44" cy="30" r="5.5" fill={CREAM} />
      <circle cx="21" cy="31" r="2.8" fill={NAVY} />
      <circle cx="43" cy="31" r="2.8" fill={NAVY} />
      <circle cx="22" cy="30" r="1" fill="#fff" />
      <circle cx="44" cy="30" r="1" fill="#fff" />

      {/* face */}
      <circle cx="29" cy="40" r="0.9" fill={GOLD_DARK} />
      <circle cx="35" cy="40" r="0.9" fill={GOLD_DARK} />
      <ellipse cx="15.5" cy="46" rx="3.5" ry="2" fill="#e07a7a" opacity="0.5" />
      <ellipse cx="48.5" cy="46" rx="3.5" ry="2" fill="#e07a7a" opacity="0.5" />
      <path d="M22 46 Q32 54 42 46" fill="none" stroke={NAVY} strokeWidth="2.2" strokeLinecap="round" />

      {/* graduation cap: skull cap, board, button, tassel */}
      <path d="M23 16 v8 q9 4 18 0 v-8 z" fill="#13294f" />
      <polygon points="32,5 53,12.5 32,20 11,12.5" fill={NAVY} stroke="#d4af37" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="32" cy="12.5" r="1.4" fill="#d4af37" />
      <path d="M32 12.5 L48 15.5 L48 23" fill="none" stroke="#d4af37" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M46.3 23 h3.4 l-0.6 4.5 h-2.2 z" fill="#d4af37" />
    </svg>
  )
}
