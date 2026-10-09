import { useEffect, useRef } from 'react'
import { Music2 } from 'lucide-react'

const TIKTOK_HANDLE = 'aboshanb_king'
const TIKTOK_URL = `https://www.tiktok.com/@${TIKTOK_HANDLE}`

function TikTokFeed({ language = 'en' }) {
  const containerRef = useRef(null)
  const isArabic = language === 'ar'
  const labels = isArabic
    ? { title: 'آخر فيديوهات تيك توك', subtitle: 'أحدث الفيديوهات من الحساب الرسمي. اسحب أو مرر جانبياً للاستكشاف.', auto: 'تحديث تلقائي' }
    : { title: 'LATEST ON TIKTOK', subtitle: 'Recent videos from the official profile. Swipe or scroll sideways to explore.', auto: 'Auto-updated' }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined
    container.innerHTML = `<blockquote class="tiktok-embed" cite="${TIKTOK_URL}" data-unique-id="${TIKTOK_HANDLE}" data-embed-type="creator" style="max-width:780px;min-width:288px;"><section><a target="_blank" rel="noopener noreferrer" href="${TIKTOK_URL}?refer=creator_embed">@${TIKTOK_HANDLE}</a></section></blockquote>`
    const script = document.createElement('script')
    script.src = 'https://www.tiktok.com/embed.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      script.remove()
      container.innerHTML = ''
    }
  }, [])

  return <section className="showcase-section section-wrap" id="tiktok">
    <div className="showcase-card">
      <div className="showcase-card-head">
        <span className="showcase-badge"><Music2 size={22} /></span>
        <div className="showcase-card-heading"><h3>{labels.title}</h3><p>{labels.subtitle}</p></div>
        <div className="showcase-card-tools"><span className="auto-pill"><i />{labels.auto}</span></div>
      </div>
      <div className="tiktok-embed-wrap" ref={containerRef} />
    </div>
  </section>
}

export default TikTokFeed