const KICK_PROXY_URL = import.meta.env.VITE_KICK_API_URL || '/api/kick-channel'
const FALLBACK_STREAM_IMAGE = `${import.meta.env.BASE_URL}images/image.webp`

export async function getKickChannel() {
  const response = await fetch(KICK_PROXY_URL, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Kick proxy request failed with ${response.status}`)
  return response.json()
}

export function normalizeKickChannel(data) {
  const livestream = data?.livestream
  const followersCount = Number(data?.followers_count)
  const rawViewerCount = livestream?.viewer_count ?? livestream?.viewers_count
  const viewerCount = Number(rawViewerCount)
  return {
    apiAvailable: data?.apiAvailable === true,
    isLive: Boolean(livestream),
    followersCount: Number.isFinite(followersCount) ? followersCount : null,
    viewerCount: rawViewerCount !== undefined && rawViewerCount !== null && rawViewerCount !== '' && Number.isFinite(viewerCount) ? viewerCount : null,
    title: livestream?.session_title || '',
    streamImage: livestream?.thumbnail?.url || data?.user?.profile_pic || FALLBACK_STREAM_IMAGE,
  }
}