import { useEffect, useState } from 'react'
import './CursorEffect.css'

const INTERACTIVE_SELECTOR = 'a, button, input, iframe, .social-card, .gallery-item, .hero-visual, .stream-frame, .live-aside'

function CursorEffect() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateEnabled = () => setEnabled(mediaQuery.matches && !reducedMotionQuery.matches)
    updateEnabled()
    mediaQuery.addEventListener('change', updateEnabled)
    reducedMotionQuery.addEventListener('change', updateEnabled)
    return () => {
      mediaQuery.removeEventListener('change', updateEnabled)
      reducedMotionQuery.removeEventListener('change', updateEnabled)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined

    const dot = document.querySelector('.cursor-effect-dot')
    const trail = document.querySelector('.cursor-effect-trail')
    let animationFrame = null
    let targetX = -100
    let targetY = -100
    let trailX = targetX
    let trailY = targetY

    const render = () => {
      trailX += (targetX - trailX) * .18
      trailY += (targetY - trailY) * .18
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`
      trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`
      animationFrame = window.requestAnimationFrame(render)
    }

    const handlePointerMove = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      document.body.classList.add('has-cursor-position')
      const isInteractive = event.target.closest(INTERACTIVE_SELECTOR)
      document.body.classList.toggle('has-cursor-hover', Boolean(isInteractive))
    }

    const handlePointerOut = (event) => {
      if (!event.relatedTarget) {
        document.body.classList.remove('has-cursor-position', 'has-cursor-hover')
      }
    }

    document.body.classList.add('has-custom-cursor')
    document.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerout', handlePointerOut, { passive: true })
    animationFrame = window.requestAnimationFrame(render)

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      document.body.classList.remove('has-custom-cursor', 'has-cursor-position', 'has-cursor-hover')
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerout', handlePointerOut)
    }
  }, [enabled])

  if (!enabled) return null

  return <>
    <span className="cursor-effect-trail" aria-hidden="true" />
    <span className="cursor-effect-dot" aria-hidden="true" />
  </>
}

export default CursorEffect
