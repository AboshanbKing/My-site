const KICK_CHANNEL_URL = 'https://kick.com/api/v2/channels/aboshanb-king'

export async function getKickChannel() {
  const response = await fetch(KICK_CHANNEL_URL, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Kick request failed with ${response.status}`)
  return response.json()
}

export function normalizeKickChannel(data) {
  const livestream = data?.livestream
  const followersCount = Number(data?.followers_count)
  return { isLive: Boolean(livestream), followersCount: Number.isFinite(followersCount) ? followersCount : null, title: livestream?.session_title || '' }
}