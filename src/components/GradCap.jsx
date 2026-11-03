// Flat graduation cap in the card's navy/gold palette (same style as the cap on FrogGrad),
// used instead of the 3D 🎓 emoji so every device renders it the same.
export default function GradCap({ size = 44, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size * 0.75}
      viewBox="0 0 64 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M18 20 v13 q14 7 28 0 v-13 z" fill="#13294f" />
      <polygon points="32,4 62,16 32,28 2,16" fill="#0b1d3a" stroke="#d4af37" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="32" cy="16" r="2" fill="#d4af37" />
      <path d="M32 16 L54 21 L54 33" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
      <path d="M51.5 33 h5 l-0.9 7 h-3.2 z" fill="#d4af37" />
    </svg>
  )
}
