const KICK_API_URL = 'https://api.kick.com/public/v1'
const KICK_OAUTH_URL = 'https://id.kick.com/oauth/token'
const DEFAULT_CHANNEL_SLUG = 'aboshanb-king'

let cachedToken = null
let tokenExpiresAt = 0

function getEnvironment() {
  const environment = globalThis.process?.env || {}
  return {
    clientId: environment.KICK_CLIENT_ID,
    clientSecret: environment.KICK_CLIENT_SECRET,
    channelSlug: environment.KICK_CHANNEL_SLUG || DEFAULT_CHANNEL_SLUG,
    allowedOrigin: environment.KICK_ALLOWED_ORIGIN || '*',
  }
}

async function getAppAccessToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const response = await fetch(KICK_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  })
  if (!response.ok) throw new Error(`Kick token request failed with ${response.status}`)

  const token = await response.json()
  if (!token.access_token) throw new Error('Kick token response did not include an access token')
  cachedToken = token.access_token
  tokenExpiresAt = Date.now() + Math.max(60, Number(token.expires_in || 3600) - 60) * 1000
  return cachedToken
}

async function kickRequest(path, token) {
  const response = await fetch(`${KICK_API_URL}${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`Kick API request failed with ${response.status}`)
  return response.json()
}

export default async function handler(request, response) {
  const { clientId, clientSecret, channelSlug, allowedOrigin } = getEnvironment()
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return response.status(204).end()
  }
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' })
  if (!clientId || !clientSecret) return response.status(500).json({ error: 'Kick server credentials are not configured' })

  try {
    const token = await getAppAccessToken(clientId, clientSecret)
    const channelResponse = await kickRequest(`/channels?slug=${encodeURIComponent(channelSlug)}`, token)
    const channel = channelResponse.data?.[0]
    if (!channel?.broadcaster_user_id) throw new Error('Kick channel was not found')

    const livestreamResponse = await kickRequest(`/livestreams?broadcaster_user_id=${channel.broadcaster_user_id}&limit=1`, token)
    const livestream = livestreamResponse.data?.[0] || null

    return response.status(200).json({
      apiAvailable: true,
      livestream,
      followers_count: channel.followers_count,
      user: { profile_pic: channel.user?.profile_pic || channel.profile_pic || '' },
    })
  } catch {
    return response.status(502).json({ error: 'Kick data is temporarily unavailable' })
  }
}
