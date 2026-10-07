import type { Config } from '@netlify/functions'
import { randomUUID } from 'node:crypto'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/index'
import { discoverySignals } from '../../db/schema'
import type { InterestProfile } from '../../src/lib/discoveries'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function visitorId(request: Request): string | undefined {
  const value = request.headers.get('cookie')?.match(/(?:^|;\s*)sthelse-visitor=([^;]+)/)?.[1]
  return value && uuidPattern.test(value) ? value : undefined
}

export async function readProfile(id: string): Promise<InterestProfile> {
  const rows = await db.select().from(discoverySignals).where(eq(discoverySignals.visitorId, id)).orderBy(desc(discoverySignals.updatedAt)).limit(250)
  const profile: InterestProfile = { shown: [], known: [], unknown: [], weights: Object.create(null) as Record<string, number> }
  for (const row of rows) {
    profile.shown.push(row.discoveryId)
    if (row.status === 'known') profile.known.push(row.discoveryId)
    if (row.status === 'unknown') profile.unknown.push(row.discoveryId)
    const weight = row.status === 'known' ? -2 : row.status === 'unknown' ? 3 : -.15
    for (const key of new Set([row.mode, row.topic, ...row.tags])) profile.weights[key] = Math.max(-12, Math.min(12, (profile.weights[key] || 0) + weight))
  }
  return profile
}

export default async (request: Request) => {
  if (!['GET', 'POST'].includes(request.method)) return Response.json({ error: 'Method not allowed' }, { status: 405, headers: { Allow: 'GET, POST' } })
  const existingId = visitorId(request)
  const id = existingId || randomUUID()
  const headers = new Headers({ 'Cache-Control': 'no-store' })
  if (!existingId) headers.set('Set-Cookie', `sthelse-visitor=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`)
  if (request.method === 'POST') {
    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Invalid origin' }, { status: 403 })
    if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({ error: 'JSON required' }, { status: 415 })
    if (Number(request.headers.get('content-length') || 0) > 4096) return Response.json({ error: 'Payload too large' }, { status: 413 })
    let body: Record<string, unknown>
    try {
      const text = await request.text()
      if (text.length > 4096) return Response.json({ error: 'Payload too large' }, { status: 413 })
      body = JSON.parse(text)
    } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
    if (!body || typeof body.id !== 'string' || !/^(vi|en):\d+$/.test(body.id) || typeof body.mode !== 'string' || !['weird', 'learn', 'explore'].includes(body.mode) || typeof body.topic !== 'string' || body.topic.length > 100 || !Array.isArray(body.tags) || body.tags.length > 8 || !body.tags.every(tag => typeof tag === 'string' && tag.length <= 100) || typeof body.action !== 'string' || !['shown', 'known', 'unknown'].includes(body.action)) return Response.json({ error: 'Invalid signal' }, { status: 400 })
    try {
      await db.insert(discoverySignals).values({ visitorId: id, discoveryId: body.id, mode: body.mode, topic: body.topic, tags: body.tags, status: body.action }).onConflictDoUpdate({
        target: [discoverySignals.visitorId, discoverySignals.discoveryId],
        set: {
          mode: body.mode,
          topic: body.topic,
          tags: body.tags,
          status: body.action === 'shown' ? sql`${discoverySignals.status}` : body.action,
          shownCount: body.action === 'shown' ? sql`${discoverySignals.shownCount} + 1` : sql`${discoverySignals.shownCount}`,
          updatedAt: new Date(),
        },
      })
    } catch { return Response.json({ error: 'Discovery memory unavailable' }, { status: 503, headers }) }
  }
  try { return Response.json(await readProfile(id), { headers }) } catch { return Response.json({ error: 'Discovery memory unavailable' }, { status: 503, headers }) }
}

export const config: Config = { method: ['GET', 'POST'] }
