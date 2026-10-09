const KICK_CHANNELS_URL = 'https://kick.com/api/v2/channels'
const CLIPS_LIMIT = 12
const REQUEST_TIMEOUT_MS = 6000

function getEnvironment() {
  const environment = globalThis.process?.env || {}
  return {
    channelSlug: environment.KICK_CHANNEL_SLUG || 'aboshanb-king',
    allowedOrigin: environment.KICK_ALLOWED_ORIGIN || '*',
  }
}

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeClip(clip, channelSlug) {
  if (!clip?.id) return null
  return {
    id: String(clip.id),
    title: clip.title || '',
    thumbnail: clip.thumbnail_url || clip.thumbnail || '',
    views: toNumber(clip.view_count ?? clip.views),
    duration: toNumber(clip.duration),
    url: `https://kick.com/${encodeURIComponent(channelSlug)}/clips/${encodeURIComponent(clip.id)}`,
  }
}

export default async function handler(request, response) {
  const { channelSlug, allowedOrigin } = getEnvironment()
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return response.status(204).end()
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const query = new URLSearchParams({ sort: 'view', time: 'all' })
    const upstream = await fetch(`${KICK_CHANNELS_URL}/${encodeURIComponent(channelSlug)}/clips?${query}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; AboshanbKingSite/1.0)',
      },
      signal: controller.signal,
    })

    if (!upstream.ok) throw new Error(`Kick clips request failed: ${upstream.status}`)

    const data = await upstream.json()
    const clips = (Array.isArray(data?.clips) ? data.clips : [])
      .map((clip) => normalizeClip(clip, channelSlug))
      .filter(Boolean)
      .slice(0, CLIPS_LIMIT)

    return response.status(200).json({ available: true, clips, upstreamKeys: Object.keys(data || {}) })
  } catch (error) {
    console.error('Kick clips error:', error)
    response.setHeader('Cache-Control', 'no-store')
    return response.status(200).json({ available: false, clips: [] })
  } finally {
    clearTimeout(timeout)
  }
}