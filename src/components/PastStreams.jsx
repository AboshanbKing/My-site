import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Eye, Play, Video } from 'lucide-react'
import { getKickVideos } from '../services/kick'

const viewsFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}

function formatDate(value, locale) {
  const text = String(value)
  const iso = text.includes('T') ? text : text.replace(' ', 'T')
  const date = new Date(/(Z|[+-]\d{2}:\d{2})$/.test(iso) ? iso : `${iso}Z`)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

function PastStreams({ kickUrl, language = 'en' }) {
  const [videos, setVideos] = useState([])
  const scrollerRef = useRef(null)
  const isArabic = language === 'ar'
  const locale = isArabic ? 'ar-EG' : 'en-US'
  const labels = isArabic
    ? { title: 'كيك · البثوث السابقة', subtitle: 'آخر البثوث المسجلة. مرر جانبياً لمشاهدة المزيد.', auto: 'تحديث تلقائي', views: 'مشاهدة', watch: 'شاهد البث', openAll: 'افتح كل البثوث على كيك', untitled: 'بث بدون عنوان', previous: 'السابق', next: 'التالي' }
    : { title: 'KICK · PAST STREAMS', subtitle: 'Recent recorded broadcasts. Scroll sideways to see more.', auto: 'Auto-updated', views: 'views', watch: 'Watch stream', openAll: 'Open all videos on Kick', untitled: 'Untitled stream', previous: 'Previous', next: 'Next' }

  useEffect(() => {
    let active = true
    getKickVideos().then((items) => { if (active) setVideos(items) }).catch(() => { if (active) setVideos([]) })
    return () => { active = false }
  }, [])

  const scrollVideos = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (videos.length === 0) return null

  return <section className="showcase-section section-wrap" id="past-streams">
    <div className="showcase-card">
      <div className="showcase-card-head">
        <span className="showcase-badge"><Video size={22} /></span>
        <div className="showcase-card-heading"><h3>{labels.title}</h3><p>{labels.subtitle}</p></div>
        <div className="showcase-card-tools">
          <span className="auto-pill"><i />{labels.auto}</span>
          <button className="showcase-arrow" type="button" onClick={() => scrollVideos(-1)} aria-label={labels.previous}><ChevronLeft size={18} /></button>
          <button className="showcase-arrow" type="button" onClick={() => scrollVideos(1)} aria-label={labels.next}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="clips-scroller" ref={scrollerRef}>
        {videos.map((video) => <a className="clip-card" key={video.id} href={video.url} target="_blank" rel="noopener noreferrer">
          <div className="clip-thumb">
            {video.thumbnail && <img src={video.thumbnail} alt="" loading="lazy" />}
            {video.date && formatDate(video.date, locale) && <span className="clip-rank">{formatDate(video.date, locale)}</span>}
            {video.duration !== null && <span className="clip-duration">{formatDuration(video.duration)}</span>}
            <span className="clip-play"><Play size={22} fill="currentColor" /></span>
          </div>
          <div className="clip-body">
            <h4 dir="auto">{video.title || labels.untitled}</h4>
            <div className="clip-meta">
              <span><Eye size={14} />{video.views !== null ? `${viewsFormatter.format(video.views)} ${labels.views}` : '--'}</span>
              <span className="clip-watch">{labels.watch} <ExternalLink size={13} /></span>
            </div>
          </div>
        </a>)}
      </div>
      <a className="showcase-open-link" href={`${kickUrl}/videos`} target="_blank" rel="noopener noreferrer">{labels.openAll} <ExternalLink size={13} /></a>
    </div>
  </section>
}

export default PastStreams