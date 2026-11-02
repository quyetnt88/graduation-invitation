import { getStore } from '@netlify/blobs'
import { timingSafeEqual } from 'node:crypto'
import { check, hit, tooMany } from '../lib/rateLimit.mjs'

// Returns every recorded visit. Protected by the STATS_PASSWORD environment variable.
function passwordMatches(given, expected) {
  const a = Buffer.from(given ?? '')
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

// Only wrong passwords count, so refreshing the dashboard never locks you out
const FAILED_LOGINS = { limit: 5, windowMs: 15 * 60 * 1000 }

export default async (req, context) => {
  const expected = process.env.STATS_PASSWORD
  if (!expected) {
    return Response.json({ error: 'Chưa cấu hình STATS_PASSWORD trên Netlify' }, { status: 500 })
  }

  const blocked = await check('stats-login', context.ip, FAILED_LOGINS)
  if (!blocked.ok) {
    const minutes = Math.ceil(blocked.retryAfter / 60)
    return tooMany(`Sai mật khẩu quá nhiều lần. Thử lại sau ${minutes} phút nhé`, blocked.retryAfter)
  }
  if (!passwordMatches(req.headers.get('x-stats-password'), expected)) {
    await hit('stats-login', context.ip, FAILED_LOGINS)
    return Response.json({ error: 'Sai mật khẩu' }, { status: 401 })
  }

  const store = getStore({ name: 'invitation-visits', consistency: 'strong' })
  const { blobs } = await store.list({ prefix: 'visits/' })
  const visits = (await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' }))))
    .filter(Boolean)
    .sort((a, b) => (b.lastOpenedAt ?? '').localeCompare(a.lastOpenedAt ?? ''))

  return Response.json({ visits }, { headers: { 'Cache-Control': 'no-store' } })
}

export const config = { path: '/api/stats' }
