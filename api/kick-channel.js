const KICK_API_URL = 'https://api.kick.com/public/v1'
const KICK_LIVESTREAM_API_URL = 'https://api.kick.com/public/v2'
const KICK_OAUTH_URL = 'https://id.kick.com/oauth/token'
const KICK_PAGE_TIMEOUT_MS = 3000

function getEnvironment() {
  const environment = globalThis.process?.env || {}
  return {
    clientId: environment.KICK_CLIENT_ID,
    clientSecret: environment.KICK_CLIENT_SECRET,
    channelSlug: environment.KICK_CHANNEL_SLUG || 'aboshanb-king',
    allowedOrigin: environment.KICK_ALLOWED_ORIGIN || '*',
  }
}

let cachedToken = null
let tokenExpiresAt = 0

async function getAppAccessToken() {
  const { clientId, clientSecret } = getEnvironment()

  if (!clientId || !clientSecret) {
    throw new Error('Kick credentials are not configured')
  }

  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  const response = await fetch(KICK_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Kick token request failed: ${response.status}`)
  }

  const data = await response.json()

  if (!data.access_token) {
    throw new Error('No access token returned by Kick')
  }

  cachedToken = data.access_token
  tokenExpiresAt =
    Date.now() + Math.max(60, Number(data.expires_in || 3600) - 60) * 1000

  return cachedToken
}

async function kickRequest(path, token, baseUrl = KICK_API_URL) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Kick API request failed: ${response.status}`)
  }

  return response.json()
}

async function getLiveStreamForBroadcaster(broadcasterUserId, token) {
  let cursor = ''

  for (let page = 0; page < 5; page += 1) {
    const query = new URLSearchParams({ limit: '100' })
    if (cursor) query.set('cursor', cursor)

    const response = await kickRequest(
      `/livestreams?${query.toString()}`,
      token,
      KICK_LIVESTREAM_API_URL
    )
    const livestream = response.data?.find(
      (item) => String(item.broadcaster_user?.id) === String(broadcasterUserId)
    )

    if (livestream) return livestream

    cursor = response.pagination?.next_cursor || ''
    if (!cursor) return null
  }

  return null
}

async function getPublicChannelFollowers(channelSlug) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), KICK_PAGE_TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://kick.com/api/v2/channels/${encodeURIComponent(channelSlug)}`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; AboshanbKingSite/1.0)',
        },
        signal: controller.signal,
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const followersCount = Number(data?.followersCount ?? data?.followers_count)
    return Number.isSafeInteger(followersCount) ? followersCount : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export default async function handler(request, response) {
  const { channelSlug, allowedOrigin } = getEnvironment()
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate')
  response.setHeader('CDN-Cache-Control', 'no-store')
  response.setHeader('Vercel-CDN-Cache-Control', 'no-store')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return response.status(204).end()
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = await getAppAccessToken()

    const channelResponse = await kickRequest(
      `/channels?slug=${encodeURIComponent(channelSlug)}`,
      token
    )

    const channel = channelResponse.data?.[0]

    if (!channel?.broadcaster_user_id) {
      return response.status(404).json({
        apiAvailable: true,
        isLive: false,
        followersCount: null,
        viewerCount: null,
        title: '',
        profilePic: '',
        livestream: null,
        error: 'Kick channel not found',
        channel: channelSlug,
      })
    }

    const [livestream, userResponse] = await Promise.all([
      getLiveStreamForBroadcaster(channel.broadcaster_user_id, token),
      kickRequest(`/users?id=${channel.broadcaster_user_id}`, token),
    ])
    const user = userResponse.data?.[0]
    const officialFollowersCount = channel.user?.followers_count ?? null
    const followersCount = officialFollowersCount ?? await getPublicChannelFollowers(channelSlug)
    const channelStream = channel.stream || null
    const isLive = Boolean(channelStream?.is_live) || Boolean(livestream)

    return response.status(200).json({
      apiAvailable: true,
      isLive,
      followersCount,
      viewerCount: channelStream?.viewer_count ?? livestream?.viewer_count ?? null,
      title: channel.stream_title || livestream?.title || '',
      profilePic: user?.profile_picture || livestream?.broadcaster_user?.profile_picture || '',
      livestream: livestream || (isLive ? channelStream : null),
    })
  } catch (error) {
    console.error('Kick API error:', error)

    return response.status(502).json({
      apiAvailable: false,
      isLive: false,
      followersCount: null,
      viewerCount: null,
      title: '',
      profilePic: '',
      livestream: null,
      error: 'Kick data is temporarily unavailable',
    })
  }
}