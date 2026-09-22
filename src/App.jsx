import { useEffect, useState } from 'react'
import { ArrowUpRight, Camera, ChevronLeft, ChevronRight, Clock3, Command, ExternalLink, Gamepad2, Menu, MessageCircle, Play, Radio, ShieldCheck, Sparkles, X } from 'lucide-react'
import { moreLinks } from './config/moreLinks'
import { socialLinks } from './config/socialLinks'
import { translations } from './config/translations'
import { getKickChannel, normalizeKickChannel } from './services/kick'
import IntroScreen from './components/IntroScreen'
import MusicPlayer from './components/MusicPlayer'
import useTilt from './hooks/useTilt'
import './App.css'

const KICK_URL = 'https://kick.com/aboshanb-king'
const galleryItems = [
  { src: `${import.meta.env.BASE_URL}images/My photo.png`, alt: 'Aboshanb King portrait' },
  { src: `${import.meta.env.BASE_URL}images/Aboshanb car.png`, alt: 'Aboshanb King beside a car at night' },
  { src: `${import.meta.env.BASE_URL}images/Aboshanb car edit.png`, alt: 'Aboshanb King car edit' },
]
const socialIcon = { kick: Radio, discord: MessageCircle, tiktok: Play, instagram: Camera, snapchat: Sparkles }

function openExternal(url) { window.open(url, '_blank', 'noopener,noreferrer') }

function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('site-language') === 'ar' ? 'ar' : 'en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [channel, setChannel] = useState({ isLive: false, followersCount: null })
  const [kickLoading, setKickLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const t = translations[language]
  useTilt()

  useEffect(() => {
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('site-language', language)
  }, [language])

  useEffect(() => {
    let active = true
    getKickChannel().then((data) => { if (active) setChannel(normalizeKickChannel(data)) }).catch(() => { if (active) setChannel({ isLive: false, followersCount: null }) }).finally(() => { if (active) setKickLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
      setShowTop(window.scrollY > 600)
      document.querySelectorAll('[data-reveal]').forEach((element) => { if (element.getBoundingClientRect().top < window.innerHeight * 0.88) element.classList.add('is-visible') })
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedImage(null)
      if (selectedImage === null) return
      if (event.key === 'ArrowRight') setSelectedImage((selectedImage + 1) % galleryItems.length)
      if (event.key === 'ArrowLeft') setSelectedImage((selectedImage - 1 + galleryItems.length) % galleryItems.length)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage])

  const closeMenu = () => setMenuOpen(false)
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); closeMenu() }
  const changeLanguage = (nextLanguage) => { setLanguage(nextLanguage); closeMenu() }

  return <>
    <IntroScreen />
    <div className="site-shell">
    <div className="loading-line" aria-hidden="true" /><div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />
    <header className="navbar"><a className="brand-mark" href="#home" onClick={closeMenu} aria-label={t.accessibility.home}><img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Aboshanb King" /></a><nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label={t.accessibility.toggleNavigation}>{[['home', t.nav.home], ['live', t.nav.live], ['socials', t.nav.socials], ['links', t.nav.links], ['gallery', t.nav.gallery]].map(([id, label]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>)}<button className="nav-kick" type="button" onClick={() => openExternal(KICK_URL)}><Radio size={15} /> {t.nav.liveOnKick}</button></nav><div className="language-switcher" aria-label={t.switcherLabel}>{['en', 'ar'].map((option) => <button key={option} className={language === option ? 'is-active' : ''} type="button" onClick={() => changeLanguage(option)} aria-label={option === 'en' ? 'English' : 'Arabic'} aria-pressed={language === option}>{option.toUpperCase()}</button>)}</div><button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={t.accessibility.toggleNavigation} aria-expanded={menuOpen}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button></header>
    <main>
      <section className="hero section-wrap" id="home"><div className="hero-grid" /><div className="hero-copy"><div className="eyebrow"><span className="status-dot" /> {t.hero.official}</div><h1>ABOSHANB <span>KING</span></h1><p className="hero-role">{t.hero.role} <span>//</span> {t.hero.creator}</p><p className="hero-description">{t.hero.description}<br />{t.hero.descriptionSecond}</p><div className="hero-actions"><button className="button button-primary" type="button" onClick={() => scrollTo('live')}><Play size={17} fill="currentColor" /> {t.hero.watchLive}</button><button className="button button-ghost" type="button" onClick={() => openExternal(KICK_URL)}>{t.hero.followKick} <ArrowUpRight size={17} /></button></div><div className="hero-meta"><span><ShieldCheck size={16} /> {t.hero.verified}</span><span><Gamepad2 size={16} /> {t.hero.entertainment}</span></div></div><div className="hero-visual"><div className="hero-ring" /><img src={`${import.meta.env.BASE_URL}images/image.webp`} alt="Aboshanb King in a blue gaming setup" /><div className="hero-caption"><span>ABOSHANB / 01</span><span>{t.hero.caption}</span></div></div><div className="followers-card"><div className="card-icon"><Command size={18} /></div><div><p>{t.hero.followers}</p><strong>{kickLoading ? '...' : channel.followersCount ?? '--'}</strong></div><span className="live-pulse" title="Public Kick channel data" /></div></section>
      <section className="live-section section-wrap" id="live" data-reveal><div className="section-heading"><div><span className="section-kicker">{t.live.kicker}</span><h2>{t.live.title} <span>KICK</span></h2></div><div className="section-status"><span className={channel.isLive ? 'status-dot live' : 'status-dot'} /> {channel.isLive ? t.live.liveNow : t.live.offline}</div></div><div className="live-layout"><div className="stream-frame">{channel.isLive ? <iframe src={`${KICK_URL}?embed=true`} title="Aboshanb King live stream" allowFullScreen /> : <div className="offline-state"><div className="offline-orb"><Radio size={35} /></div><span className="offline-label">{t.live.offline}</span><h3>{t.live.nextSession}</h3><p>{t.live.followNotice}</p><button className="button button-primary" type="button" onClick={() => openExternal(KICK_URL)}>{t.hero.followKick} <ExternalLink size={16} /></button></div>}</div><aside className="live-aside"><span className="section-kicker">{t.live.status}</span><div className="aside-line"><Clock3 size={18} /><div><small>{t.live.channel}</small><strong>@aboshanb-king</strong></div></div><div className="aside-line"><Radio size={18} /><div><small>{t.live.platform}</small><strong>KICK</strong></div></div><p>{channel.isLive && channel.title ? channel.title : t.live.quiet}</p><button className="text-link" type="button" onClick={() => openExternal(KICK_URL)}>{t.live.openChannel} <ArrowUpRight size={16} /></button></aside></div></section>
      <section className="socials-section section-wrap" id="socials" data-reveal><div className="section-heading"><div><span className="section-kicker">{t.socials.kicker}</span><h2>{t.socials.title} <span>{language === 'ar' ? '' : 'SOCIALS'}</span></h2></div><p className="heading-note">{t.socials.note}</p></div><div className="social-grid">{socialLinks.map((social) => { const Icon = socialIcon[social.icon]; return <article className="social-card" key={social.name}><div className="social-top"><div className="social-icon"><Icon size={21} /></div><ArrowUpRight className="social-arrow" size={19} /></div><h3>{social.name}</h3><span>{t.socials.handles[social.name] || social.handle}</span><p>{t.socials.descriptions[social.name]}</p><button className="text-link" type="button" onClick={() => openExternal(social.url)}>{t.socials.visit} {social.name} <ExternalLink size={14} /></button></article> })}</div></section>
      <section className="more-section section-wrap" id="links" data-reveal><div className="more-panel"><div><span className="section-kicker">{t.more.kicker}</span><h2>{t.more.title} <span>{language === 'ar' ? 'الروابط' : 'LINKS'}</span></h2><p>{t.more.description}</p></div>{moreLinks.length > 0 && <a className="coming-soon" href={moreLinks[0].url} target="_blank" rel="noopener noreferrer"><Sparkles size={19} /><span>{t.more.allLinks}</span></a>}</div></section>
      <section className="gallery-section section-wrap" id="gallery" data-reveal><div className="section-heading"><div><span className="section-kicker">{t.gallery.kicker}</span><h2>{t.gallery.title} {t.gallery.label && <span>{t.gallery.label}</span>}</h2></div><p className="heading-note">{t.gallery.note}</p></div><div className="gallery-grid">{galleryItems.map((item, index) => <button className={`gallery-item gallery-item-${index + 1}`} type="button" key={item.src} onClick={() => setSelectedImage(index)}><img src={item.src} alt={item.alt} loading="lazy" /><span className="gallery-overlay"><span>{t.gallery.viewFrame} 0{index + 1}</span><ArrowUpRight size={19} /></span></button>)}</div></section>
    </main>
    <footer className="footer section-wrap"><a className="brand-mark" href="#home"><img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Aboshanb King" /></a><p>© 2026 Aboshanb King<br /><span>{t.footer.rights}</span></p><div className="footer-socials">{socialLinks.map((social) => { const Icon = socialIcon[social.icon]; return <button key={social.name} type="button" aria-label={social.name} onClick={() => openExternal(social.url)}><Icon size={17} /></button> })}</div></footer>
    <MusicPlayer language={language} />
    {showTop && <button className="back-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t.accessibility.backToTop}><ChevronLeft size={17} /></button>}
    {selectedImage !== null && <div className="lightbox" role="dialog" aria-modal="true" aria-label={t.accessibility.galleryViewer} onClick={() => setSelectedImage(null)}><button className="lightbox-close" type="button" onClick={() => setSelectedImage(null)} aria-label={t.accessibility.closeGallery}><X size={24} /></button><button className="lightbox-nav lightbox-prev" type="button" onClick={(event) => { event.stopPropagation(); setSelectedImage((selectedImage - 1 + galleryItems.length) % galleryItems.length) }} aria-label={t.accessibility.previousImage}><ChevronLeft size={28} /></button><img src={galleryItems[selectedImage].src} alt={galleryItems[selectedImage].alt} onClick={(event) => event.stopPropagation()} /><button className="lightbox-nav lightbox-next" type="button" onClick={(event) => { event.stopPropagation(); setSelectedImage((selectedImage + 1) % galleryItems.length) }} aria-label={t.accessibility.nextImage}><ChevronRight size={28} /></button></div>}
    </div>
  </>
}

export default App