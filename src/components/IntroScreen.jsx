import { useEffect, useState } from 'react'
import './IntroScreen.css'

const BOOT_MESSAGES = [
  'CONNECTING TO KICK...',
  'LOADING PROFILE...',
  'INITIALIZING STREAM...',
  'READY.',
]

function IntroScreen() {
  const [phase, setPhase] = useState('enter')
  const [progress, setProgress] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (phase !== 'booting') return

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        const next = current + 4
        return next >= 100 ? 100 : next
      })
    }, 45)

    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => Math.min(current + 1, BOOT_MESSAGES.length - 1))
    }, 500)

    const exitTimer = window.setTimeout(() => setPhase('exiting'), 2100)
    const removeTimer = window.setTimeout(() => setPhase('removed'), 2700)

    return () => {
      window.clearInterval(progressTimer)
      window.clearInterval(messageTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(removeTimer)
    }
  }, [phase])

  if (phase === 'removed') return null

  const handleEnter = () => {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/welcome.mp3`)
    audio.volume = 0.6
    audio.play().catch(() => {})
    setPhase('booting')
  }

  return <div className={`intro-screen intro-screen--${phase}`} aria-label="ABOSHANB" role="status">
    {phase === 'enter' && <>
      <span className="intro-screen-word">ABOSHANB</span>
      <span className="intro-screen-subword">KING</span>
      <button className="intro-enter-button" type="button" onClick={handleEnter}>
        ENTER ABOSHANB WEBSITE
      </button>
    </>}
    {(phase === 'booting' || phase === 'exiting') && <div className="boot-screen">
      <div className="boot-scanline" />
      <span className="boot-word">ABOSHANB</span>
      <div className="boot-bar-track">
        <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="boot-message">{BOOT_MESSAGES[messageIndex]}</span>
      <span className="boot-percent">{progress}%</span>
    </div>}
  </div>
}

export default IntroScreen
