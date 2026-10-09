import { Eye, ExternalLink, Gamepad2, Radio, RefreshCw } from 'lucide-react'

function LiveShowcase({ channel, language = 'en', kickUrl, embedUrl, chatUrl, onSync, syncing = false }) {
  const isArabic = language === 'ar'
  const labels = isArabic
    ? { liveNow: 'مباشر الآن', offline: 'غير متصل', unavailable: 'الحالة غير متاحة', watching: 'يتابعون الآن', statusLabel: 'حالة البث', viewers: 'مشاهد', viewersUnavailable: 'المشاهدون غير متاحين', streamOffline: 'البث غير متصل', noTitle: 'عنوان البث غير متاح', watch: 'شاهد على كيك', chat: 'شات كيك', openInKick: 'افتح في كيك', chatNote: 'الشات مش بيظهر أو عايز تبعت رسالة؟ افتح كيك وسجل دخول.', syncNow: 'تحديث الآن', nextSession: 'الجلسة القادمة قريباً', followNotice: 'تابعني على كيك عشان تعرف أول ما أبدأ البث.', follow: 'تابعني على كيك', playerTitle: 'بث أبوشنب كينج المباشر', chatTitle: 'شات كيك' }
    : { liveNow: 'LIVE NOW', offline: 'OFFLINE', unavailable: 'STATUS UNAVAILABLE', watching: 'WATCHING NOW', statusLabel: 'STREAM STATUS', viewers: 'viewers', viewersUnavailable: 'Viewers unavailable', streamOffline: 'Stream offline', noTitle: 'Stream title unavailable', watch: 'Watch on Kick', chat: 'KICK CHAT', openInKick: 'Open in Kick', chatNote: 'Chat not loading or want to send a message? Open in Kick and sign in.', syncNow: 'Sync now', nextSession: 'Next session loading...', followNotice: 'Follow me on Kick to know when I go live.', follow: 'Follow on Kick', playerTitle: 'Aboshanb King live stream', chatTitle: 'Kick chat' }

  const statusText = !channel.apiAvailable ? labels.unavailable : channel.isLive ? labels.liveNow : labels.offline
  const syncSeconds = channel.isLive ? 15 : 60
  const syncText = isArabic
    ? `تحديث تلقائي كل ${syncSeconds} ثانية`
    : `${channel.isLive ? 'LIVE, ' : ''}AUTO-SYNCED EVERY ${syncSeconds}S`
  const viewersChip = channel.isLive && channel.apiAvailable && channel.viewerCount !== null
    ? <><strong>{channel.viewerCount.toLocaleString()}</strong> {labels.viewers}</>
    : (!channel.apiAvailable || channel.isLive ? labels.viewersUnavailable : labels.streamOffline)

  return <div className="live-showcase">
    <div className="live-showcase-top">
      <span className={`live-pill${channel.isLive ? ' is-live' : ''}`}><i />{statusText}</span>
      <a className="live-showcase-link" href={kickUrl} target="_blank" rel="noopener noreferrer">{kickUrl.replace('https://', '')}</a>
    </div>
    <div className="live-showcase-grid">
      <div className="live-showcase-main">
        <div className="live-showcase-player">
          {channel.isLive ? <iframe src={embedUrl} title={labels.playerTitle} allowFullScreen allow="autoplay; fullscreen" /> : <div className="offline-state">
            <div className="offline-orb"><Radio size={35} /></div>
            <span className="offline-label">{channel.apiAvailable ? labels.offline : labels.unavailable}</span>
            <h3>{channel.apiAvailable ? labels.nextSession : labels.unavailable}</h3>
            <p>{labels.followNotice}</p>
            <a className="button button-primary" href={kickUrl} target="_blank" rel="noopener noreferrer">{labels.follow} <ExternalLink size={16} /></a>
          </div>}
        </div>
        <div className="live-showcase-info">
          <span className={`watching-label${channel.isLive ? ' is-live' : ''}`}><i />{channel.isLive ? labels.watching : labels.statusLabel}</span>
          <h3 className="live-showcase-title">{channel.title || labels.noTitle}</h3>
          <div className="live-showcase-chips">
            <span><Eye size={15} />{viewersChip}</span>
            {channel.categoryName && <span><Gamepad2 size={15} />{channel.categoryName}</span>}
          </div>
          <a className="button button-primary live-showcase-watch" href={kickUrl} target="_blank" rel="noopener noreferrer"><Radio size={16} /> {labels.watch} <ExternalLink size={14} /></a>
        </div>
      </div>
      <aside className="live-showcase-chat" aria-label={labels.chatTitle}>
        <div className="live-showcase-chat-head"><strong>{labels.chat}</strong><a href={kickUrl} target="_blank" rel="noopener noreferrer">{labels.openInKick} <ExternalLink size={13} /></a></div>
        <iframe src={chatUrl} title={labels.chatTitle} loading="lazy" />
        <p className="live-showcase-chat-note">{labels.chatNote}</p>
      </aside>
    </div>
    <div className="live-showcase-footer">
      <span className="live-showcase-sync-status"><i />{syncText}</span>
      <button className="live-showcase-sync" type="button" onClick={onSync} disabled={syncing}><RefreshCw size={14} className={syncing ? 'is-spinning' : ''} /> {labels.syncNow}</button>
    </div>
  </div>
}

export default LiveShowcase