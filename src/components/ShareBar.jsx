import { useState } from 'react'
import { downloadCard } from '../utils/downloadCard.js'

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
    try {
      await downloadCard(cardRef.current, guest)
    } catch {
      setError('Tải ảnh chưa được, bạn thử lại giúp mình nha 🙏')
    } finally {
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
