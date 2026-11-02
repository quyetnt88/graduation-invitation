import { getStore } from '@netlify/blobs'
import { containsProfanity } from '../../src/utils/profanity.js'
import { bumpTotal, hit, tooMany } from '../lib/rateLimit.mjs'

// Records what a guest does on the invitation. One JSON blob per visit: visits/<id>
const TYPES = ['open', 'no', 'yes']

// A real guest sends ~10 events (open + a few "no" + "yes"); several guests may share one Wi-Fi IP
const EVENTS_PER_IP = { limit: 60, windowMs: 10 * 60 * 1000 }
const NEW_VISITS_PER_IP = { limit: 30, windowMs: 60 * 60 * 1000 }
const MAX_TOTAL_VISITS = 1000
const MAX_BODY_BYTES = 2048

export default async (req, context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  if (Number(req.headers.get('content-length')) > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 })
  }

  const limited = await hit('track', context.ip, EVENTS_PER_IP)
  if (!limited.ok) return tooMany('Gửi quá nhiều, thử lại sau nhé', limited.retryAfter)

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, type } = body ?? {}
  if (typeof id !== 'string' || !/^[\w-]{8,64}$/.test(id) || !TYPES.includes(type)) {
    return Response.json({ error: 'Invalid event' }, { status: 400 })
  }

  const store = getStore({ name: 'invitation-visits', consistency: 'strong' })
  const key = `visits/${id}`
  const now = new Date().toISOString()
  let visit = await store.get(key, { type: 'json' })

  if (type === 'open') {
    const name = String(body.name ?? '').trim().slice(0, 60)
    if (!name || containsProfanity(name)) return Response.json({ error: 'Invalid name' }, { status: 400 })
    if (!visit) {
      const fresh = await hit('new-visit', context.ip, NEW_VISITS_PER_IP)
      if (!fresh.ok) return tooMany('Quá nhiều lượt mở thiệp mới, thử lại sau nhé', fresh.retryAfter)
      if (!(await bumpTotal('visits', MAX_TOTAL_VISITS))) {
        return Response.json({ error: 'Đã đạt giới hạn số lượt ghi nhận' }, { status: 507 })
      }
      visit = { id, name, openCount: 0, noCount: 0, accepted: false, firstOpenedAt: now }
    }
    visit.name = name
    visit.openCount += 1
    visit.lastOpenedAt = now
  } else {
    // "no"/"yes" only make sense after the guest opened the card
    if (!visit) return Response.json({ error: 'Unknown visit' }, { status: 404 })
    const noCount = Math.min(Math.max(Number(body.noCount) || 0, 0), 99)
    visit.noCount = Math.max(visit.noCount, noCount)
    if (type === 'yes' && !visit.accepted) {
      visit.accepted = true
      visit.acceptedAt = now
    }
  }

  await store.setJSON(key, visit)
  return Response.json({ ok: true })
}

export const config = { path: '/api/track' }
