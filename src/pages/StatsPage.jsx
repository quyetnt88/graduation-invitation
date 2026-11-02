import { useEffect, useState } from 'react'
import '../App.css'
import './StatsPage.css'

const PASSWORD_KEY = 'stats-password'

function readSaved() {
  try {
    return sessionStorage.getItem(PASSWORD_KEY) || ''
  } catch {
    return ''
  }
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCsv(visits) {
  const header = ['Tên', 'Số lần mở', 'Mở lần đầu', 'Mở gần nhất', 'Sẽ đến', 'Lúc đồng ý', 'Số lần bấm "Rất tiếc"']
  const rows = visits.map((v) => [
    v.name,
    v.openCount,
    formatTime(v.firstOpenedAt),
    formatTime(v.lastOpenedAt),
    v.accepted ? 'Có' : 'Chưa',
    formatTime(v.acceptedAt),
    v.noCount,
  ])
  // Guest names are user input: prefix formula-like cells so Excel won't run "=..." as a formula
  const escape = (cell) => {
    const text = String(cell ?? '').replace(/^[=+\-@\t\r]/, "'$&")
    return `"${text.replace(/"/g, '""')}"`
  }
  // BOM so Excel reads Vietnamese correctly
  return '﻿' + [header, ...rows].map((r) => r.map(escape).join(',')).join('\n')
}

export default function StatsPage() {
  const [password, setPassword] = useState(readSaved)
  const [input, setInput] = useState('')
  const [visits, setVisits] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (pw) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stats', { headers: { 'x-stats-password': pw } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Lỗi ${res.status}`)
      setVisits(data.visits)
      setPassword(pw)
      try {
        sessionStorage.setItem(PASSWORD_KEY, pw)
      } catch {
        // ignore
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Không kết nối được máy chủ' : err.message)
      setVisits(null)
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Auto-load once with the password saved earlier in this tab
    if (password) load(password)
  }, [])

  if (!visits) {
    return (
      <div className="stats-page">
        <form
          className="stats-login"
          onSubmit={(e) => {
            e.preventDefault()
            if (input) load(input)
          }}
        >
          <h1>📊 Thống kê thiệp mời</h1>
          <p>Nhập mật khẩu để xem danh sách khách</p>
          <input type="password" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Mật khẩu" autoFocus />
          <button className="btn btn-gold" disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem thống kê'}
          </button>
          {error && <p className="stats-error">{error}</p>}
        </form>
      </div>
    )
  }

  const accepted = visits.filter((v) => v.accepted)
  const totalNo = visits.reduce((sum, v) => sum + v.noCount, 0)
  const stubborn = [...visits].sort((a, b) => b.noCount - a.noCount)[0]

  return (
    <div className="stats-page">
      <header className="stats-head">
        <h1>📊 Thống kê thiệp mời</h1>
        <div className="stats-actions">
          <button className="btn btn-outline" onClick={() => load(password)} disabled={loading}>
            {loading ? 'Đang tải...' : '🔄 Làm mới'}
          </button>
          <button className="btn btn-outline" onClick={() => download('thong-ke.json', JSON.stringify(visits, null, 2), 'application/json')}>
            ⬇️ JSON
          </button>
          <button className="btn btn-outline" onClick={() => download('thong-ke.csv', toCsv(visits), 'text/csv;charset=utf-8')}>
            ⬇️ CSV (Excel)
          </button>
        </div>
      </header>

      <section className="stats-tiles">
        <div className="tile">
          <span className="tile-value">{visits.length}</span>
          <span className="tile-label">Người đã mở thiệp</span>
        </div>
        <div className="tile">
          <span className="tile-value">{accepted.length}</span>
          <span className="tile-label">Sẽ đến 💛</span>
        </div>
        <div className="tile">
          <span className="tile-value">{visits.length - accepted.length}</span>
          <span className="tile-label">Chưa trả lời</span>
        </div>
        <div className="tile">
          <span className="tile-value">{totalNo}</span>
          <span className="tile-label">Lượt bấm "Rất tiếc"</span>
        </div>
      </section>

      {stubborn?.noCount > 0 && (
        <p className="stats-fun">
          🏆 Khách "cứng đầu" nhất: <strong>{stubborn.name}</strong> — bấm "Rất tiếc" {stubborn.noCount} lần
        </p>
      )}

      {visits.length === 0 ? (
        <p className="stats-empty">Chưa có ai mở thiệp. Gửi link cho bạn bè đi nào! 💌</p>
      ) : (
        <div className="stats-table-wrap">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Tên khách</th>
                <th>Trạng thái</th>
                <th>Bấm "Rất tiếc"</th>
                <th>Số lần mở</th>
                <th>Mở gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id}>
                  <td className="name-cell">{v.name}</td>
                  <td>
                    <span className={`badge ${v.accepted ? 'yes' : 'pending'}`}>{v.accepted ? 'Sẽ đến' : 'Chưa trả lời'}</span>
                  </td>
                  <td>{v.noCount}</td>
                  <td>{v.openCount}</td>
                  <td>{formatTime(v.lastOpenedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
