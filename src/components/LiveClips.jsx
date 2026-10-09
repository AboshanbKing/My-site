import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, Eye, Film, Play } from 'lucide-react'
import { getKickClips } from '../services/kick'

const viewsFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function LiveClips({ kickUrl, language = 'en' }) {
  const [clips, setClips] = useState([])
  const scrollerRef = useRef(null)
  const isArabic = language === 'ar'
  const labels = isArabic
    ? { title: 'كيك · الأكثر مشاهدة', subtitle: 'مرتبة حسب المشاهدات. مرر جانبياً لمشاهدة المزيد من الكليبات.', auto: 'تحديث تلقائي', views: 'مشاهدة', watch: 'شاهد الكليب', openAll: 'افتح كل الكليبات على كيك', untitled: 'كليب بدون عنوان', previous: 'السابق', next: 'التالي' }
    : { title: 'KICK · MOST VIEWED', subtitle: 'Ranked by views. Scroll sideways to see more clips.', auto: 'Auto-updated', views: 'views', watch: 'Watch clip', openAll: 'Open all clips on Kick', untitled: 'Untitled clip', previous: 'Previous', next: 'Next' }

  useEffect(() => {
    let active = true
    getKickClips().then((items) => { if (active) setClips(items) }).catch(() => { if (active) setClips([]) })
    return () => { active = false }
  }, [])

  const scrollClips = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (clips.length === 0) return null

  return <section className="showcase-section section-wrap" id="clips">
    <div className="showcase-card">
      <div className="showcase-card-head">
        <span className="showcase-badge"><Film size={22} /></span>
        <div className="showcase-card-heading"><h3>{labels.title}</h3><p>{labels.subtitle}</p></div>
        <div className="showcase-card-tools">
          <span className="auto-pill"><i />{labels.auto}</span>
          <button className="showcase-arrow" type="button" onClick={() => scrollClips(-1)} aria-label={labels.previous}><ChevronLeft size={18} /></button>
          <button className="showcase-arrow" type="button" onClick={() => scrollClips(1)} aria-label={labels.next}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="clips-scroller" ref={scrollerRef}>
        {clips.map((clip, index) => <a className="clip-card" key={clip.id} href={clip.url} target="_blank" rel="noopener noreferrer">
          <div className="clip-thumb">
            {clip.thumbnail && <img src={clip.thumbnail} alt="" loading="lazy" />}
            <span className="clip-rank">#{index + 1}</span>
            {clip.duration !== null && <span className="clip-duration">{formatDuration(clip.duration)}</span>}
            <span className="clip-play"><Play size={22} fill="currentColor" /></span>
          </div>
          <div className="clip-body">
            <h4 dir="auto">{clip.title || labels.untitled}</h4>
            <div className="clip-meta">
              <span><Eye size={14} />{clip.views !== null ? `${viewsFormatter.format(clip.views)} ${labels.views}` : '--'}</span>
              <span className="clip-watch">{labels.watch} <ExternalLink size={13} /></span>
            </div>
          </div>
        </a>)}
      </div>
      <a className="showcase-open-link" href={`${kickUrl}/clips`} target="_blank" rel="noopener noreferrer">{labels.openAll} <ExternalLink size={13} /></a>
    </div>
  </section>
}

export default LiveClips