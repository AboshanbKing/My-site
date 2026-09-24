import { useEffect, useState } from 'react'
import './IntroScreen.css'

const INTRO_EXIT_DELAY = 1050
const INTRO_REMOVE_DELAY = 1580
const REDUCED_EXIT_DELAY = 80
const REDUCED_REMOVE_DELAY = 240

function IntroScreen() {
  const [phase, setPhase] = useState('visible')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const exitDelay = prefersReducedMotion ? REDUCED_EXIT_DELAY : INTRO_EXIT_DELAY
    const removeDelay = prefersReducedMotion ? REDUCED_REMOVE_DELAY : INTRO_REMOVE_DELAY
    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    const exitTimer = window.setTimeout(() => setPhase('exiting'), exitDelay)
    const removeTimer = window.setTimeout(() => {
      document.body.style.overflow = originalOverflow
      setPhase('removed')
    }, removeDelay)

    let played = false
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/welcome.mp3`)
    audio.volume = 0.6
    const tryPlay = () => {
      if (played) return
      audio.play().then(() => { played = true }).catch(() => {})
    }
    tryPlay()
    const fallbackPlay = () => {
      if (played) return
      tryPlay()
    }
    window.addEventListener('click', fallbackPlay)
    window.addEventListener('keydown', fallbackPlay)
    window.addEventListener('scroll', fallbackPlay)
    window.addEventListener('touchstart', fallbackPlay)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(removeTimer)
      document.body.style.overflow = originalOverflow
      window.removeEventListener('click', fallbackPlay)
      window.removeEventListener('keydown', fallbackPlay)
      window.removeEventListener('scroll', fallbackPlay)
      window.removeEventListener('touchstart', fallbackPlay)
    }
  }, [])

  if (phase === 'removed') return null

  return <div className={`intro-screen intro-screen--${phase}`} aria-label="ABOSHANB" role="status">
    <span className="intro-screen-word">ABOSHANB</span>
  </div>
}

export default IntroScreen
