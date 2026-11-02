// One id per page load, so the stats page can group a guest's actions together
const visitId =
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

// Fire-and-forget: tracking must never break the invitation (e.g. under plain `vite` there's no /api)
export function track(type, data = {}) {
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: visitId, type, ...data }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // ignore
  }
}
