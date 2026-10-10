const KICK_PROXY_URL = import.meta.env.VITE_KICK_API_URL || '/api/kick-channel'
const FALLBACK_STREAM_IMAGE = `${import.meta.env.BASE_URL}images/image.webp`
const KICK_CLIPS_URL = import.meta.env.VITE_KICK_CLIPS_URL || KICK_PROXY_URL.replace('kick-channel', 'kick-clips')
const KICK_VIDEOS_URL = import.meta.env.VITE_KICK_VIDEOS_URL || KICK_PROXY_URL.replace('kick-channel', 'kick-videos')

export async function getKickChannel() {
  const response = await fetch(KICK_PROXY_URL, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Kick proxy request failed with ${response.status}`)
  return response.json()
}

export async function getKickClips() {
  const response = await fetch(KICK_CLIPS_URL, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Kick clips request failed with ${response.status}`)
  const data = await response.json()
  return Array.isArray(data?.clips) ? data.clips : []
}

export async function getKickVideos() {
  const response = await fetch(KICK_VIDEOS_URL, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Kick videos request failed with ${response.status}`)
  const data = await response.json()
  return Array.isArray(data?.videos) ? data.videos : []
}

export function normalizeKickChannel(data) {
  const livestream = data?.livestream
  const thumbnail = typeof livestream?.thumbnail === 'string' ? livestream.thumbnail : livestream?.thumbnail?.url
  const followersValue = data?.followersCount ?? data?.followers_count
  const followersCount = Number(followersValue)
  const rawViewerCount = data?.viewerCount ?? livestream?.viewer_count ?? livestream?.viewers_count
  const viewerCount = Number(rawViewerCount)
  return {
    apiAvailable: data?.apiAvailable === true,
    isLive: data?.isLive === true || Boolean(livestream),
    followersCount: followersValue !== undefined && followersValue !== null && Number.isFinite(followersCount) ? followersCount : null,
    viewerCount: rawViewerCount !== undefined && rawViewerCount !== null && rawViewerCount !== '' && Number.isFinite(viewerCount) ? viewerCount : null,
    title: data?.title || livestream?.session_title || '',
    categoryName: data?.categoryName || data?.category?.name || livestream?.category?.name || '',
    streamImage: data?.streamImage || thumbnail || data?.profilePic || data?.user?.profile_pic || FALLBACK_STREAM_IMAGE,
  }
}