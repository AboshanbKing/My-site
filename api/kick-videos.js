const KICK_CHANNELS_URL = 'https://kick.com/api/v2/channels'
const VIDEOS_LIMIT = 12
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

function normalizeVideo(video, channelSlug) {
  const uuid = video?.video?.uuid || video?.uuid
  if (!uuid) return null
  const thumbnail = video.thumbnail
  const rawDuration = toNumber(video.duration)
  return {
    id: String(uuid),
    title: video.session_title || video.title || '',
    thumbnail: (typeof thumbnail === 'string' ? thumbnail : thumbnail?.src || thumbnail?.url) || video.video?.thumb || '',
    views: toNumber(video.views ?? video.video?.views),
    duration: rawDuration === null ? null : rawDuration > 86400 ? rawDuration / 1000 : rawDuration,
    date: video.start_time || video.created_at || video.video?.created_at || '',
    url: `https://kick.com/${encodeURIComponent(channelSlug)}/videos/${encodeURIComponent(uuid)}`,
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
    const upstream = await fetch(`${KICK_CHANNELS_URL}/${encodeURIComponent(channelSlug)}/videos`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; AboshanbKingSite/1.0)',
      },
      signal: controller.signal,
    })

    if (!upstream.ok) throw new Error(`Kick videos request failed: ${upstream.status}`)

    const data = await upstream.json()
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.videos) ? data.videos : []
    const videos = list
      .map((video) => normalizeVideo(video, channelSlug))
      .filter(Boolean)
      .slice(0, VIDEOS_LIMIT)

    return response.status(200).json({ available: true, videos, sampleKeys: Object.keys(list[0] || {}) })
  } catch (error) {
    console.error('Kick videos error:', error)
    response.setHeader('Cache-Control', 'no-store')
    return response.status(200).json({ available: false, videos: [] })
  } finally {
    clearTimeout(timeout)
  }
}
