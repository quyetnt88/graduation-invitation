import { useState } from 'react'
import { toPng } from 'html-to-image'

// Turns a guest name into a safe file name: "Chị Lan" -> "thiep-moi-chi-lan.png"
function fileNameFor(guest) {
  const slug = guest
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `thiep-moi-${slug || 'tot-nghiep'}.png`
}

const CARD_FONTS = [
  '700 1em "Dancing Script"',
  '600 1em "Dancing Script"',
  '500 1em "Playfair Display"',
  '700 1em "Playfair Display"',
  '400 1em "Be Vietnam Pro"',
  'italic 400 1em "Be Vietnam Pro"',
  '500 1em "Be Vietnam Pro"',
]

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for browsers/contexts without the async clipboard API
    const area = document.createElement('textarea')
    area.value = text
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export default function ShareBar({ guest, cardRef }) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const link = `${window.location.origin}/?to=${encodeURIComponent(guest)}`

  const handleCopy = async () => {
    setError('')
    if (await copyText(link)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      setError('Không copy được, bạn copy tay link này nha: ' + link)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current || saving) return
    setSaving(true)
    setError('')
    const node = cardRef.current
    // Hide live-only bits (RSVP, countdown, map link); CSS rebalances the columns for the picture
    node.classList.add('is-capturing')
    try {
      // Short timer instead of requestAnimationFrame, which never fires in background/hidden tabs
      await new Promise((resolve) => setTimeout(resolve, 50))
      // Make sure every font the card uses is loaded first, otherwise the picture falls back to system fonts
      await Promise.all(CARD_FONTS.map((font) => document.fonts.load(font, 'Nguyễn Đạt')))
      await document.fonts.ready
      const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = fileNameFor(guest)
      a.click()
    } catch {
      setError('Tải ảnh chưa được, bạn thử lại giúp mình nha 🙏')
    } finally {
      node.classList.remove('is-capturing')
      setSaving(false)
    }
  }

  return (
    <div className="share-bar no-print">
      <button className="btn btn-gold" onClick={handleCopy}>
        {copied ? '✅ Đã copy link!' : '🔗 Copy link mời'}
      </button>
      <button className="btn btn-outline" onClick={handleDownload} disabled={saving}>
        {saving ? '⏳ Đang tạo ảnh...' : '📥 Tải thiệp (ảnh)'}
      </button>
      {error && <p className="share-error">{error}</p>}
    </div>
  )
}
