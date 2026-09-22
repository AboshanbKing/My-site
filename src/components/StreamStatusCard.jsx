import { ExternalLink, Eye, Radio } from 'lucide-react'

const KICK_URL = 'https://kick.com/aboshanb-king'

function StreamStatusCard({ channel, language = 'en' }) {
  const isArabic = language === 'ar'
  const labels = isArabic
    ? { live: 'مباشر الآن', offline: 'غير متصل', unavailable: 'المشاهدون غير متاحين', offlineViewers: 'البث غير متصل', watch: 'شاهد البث', title: 'عنوان البث غير متاح', channel: 'حالة البث' }
    : { live: 'LIVE NOW', offline: 'OFFLINE', unavailable: 'Viewers unavailable', offlineViewers: 'Stream offline', watch: 'WATCH LIVE', title: 'Stream title unavailable', channel: 'STREAM STATUS' }
  const viewerLabel = !channel.apiAvailable
    ? labels.unavailable
    : channel.isLive
    ? channel.viewerCount === null ? labels.unavailable : `${channel.viewerCount.toLocaleString()} ${isArabic ? 'مشاهد' : 'viewers'}`
    : labels.offlineViewers

  return <aside className="live-aside stream-status-card">
    <div className="stream-status-media">
      <img src={channel.streamImage} alt="" />
      <span className={`stream-status-badge${channel.isLive ? ' is-live' : ''}`}><i />{channel.isLive ? labels.live : labels.offline}</span>
    </div>
    <span className="section-kicker">{labels.channel}</span>
    <div className="stream-status-viewers"><Eye size={17} /><strong>{viewerLabel}</strong></div>
    <p className="stream-status-title">{channel.title || labels.title}</p>
    {channel.isLive && <a className="text-link stream-status-link" href={KICK_URL} target="_blank" rel="noopener noreferrer"><Radio size={15} /> {labels.watch} <ExternalLink size={14} /></a>}
  </aside>
}

export default StreamStatusCard
