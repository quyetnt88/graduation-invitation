import { getStore } from '@netlify/blobs'
import { createHash } from 'node:crypto'

// Fixed-window counters kept in their own blob store.
// IPs are hashed so raw addresses are never stored.
const store = () => getStore({ name: 'invitation-ratelimit', consistency: 'strong' })

const hashIp = (ip) => createHash('sha256').update(String(ip ?? 'unknown')).digest('hex').slice(0, 32)

async function read(key, windowMs) {
  const entry = await store().get(key, { type: 'json' })
  const now = Date.now()
  return !entry || now - entry.start >= windowMs ? { start: now, count: 0 } : entry
}

function retryAfter(entry, windowMs) {
  return Math.max(1, Math.ceil((entry.start + windowMs - Date.now()) / 1000))
}

// Counts one hit. Returns { ok: false, retryAfter } once the limit is reached.
export async function hit(bucket, ip, { limit, windowMs }) {
  const key = `${bucket}/${hashIp(ip)}`
  const entry = await read(key, windowMs)
  if (entry.count >= limit) return { ok: false, retryAfter: retryAfter(entry, windowMs) }
  entry.count += 1
  await store().setJSON(key, entry)
  return { ok: true }
}

// Checks the limit without counting (used to count only failed password attempts).
export async function check(bucket, ip, { limit, windowMs }) {
  const entry = await read(`${bucket}/${hashIp(ip)}`, windowMs)
  return entry.count >= limit ? { ok: false, retryAfter: retryAfter(entry, windowMs) } : { ok: true }
}

// Site-wide counter with a hard ceiling (not per IP, never resets).
export async function bumpTotal(name, max) {
  const key = `total/${name}`
  const count = (await store().get(key, { type: 'json' })) ?? 0
  if (count >= max) return false
  await store().setJSON(key, count + 1)
  return true
}

export function tooMany(message, seconds) {
  return Response.json({ error: message }, { status: 429, headers: { 'Retry-After': String(seconds) } })
}
