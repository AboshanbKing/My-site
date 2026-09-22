import { useEffect } from 'react'

const MAX_ROTATION = 6
const HOVER_SCALE = 1.02
const TILT_SELECTOR = '.hero-visual, .followers-card, .stream-frame, .live-aside, .social-card, .more-panel, .gallery-item'

function useTilt() {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const canTilt = () => mediaQuery.matches && !reducedMotionQuery.matches
    let animationFrame = null
    let activeElement = null
    let nextRotation = { x: 0, y: 0 }

    const applyTilt = () => {
      animationFrame = null
      if (!activeElement) return
      activeElement.style.setProperty('--tilt-rotate-x', `${nextRotation.x}deg`)
      activeElement.style.setProperty('--tilt-rotate-y', `${nextRotation.y}deg`)
    }

    const scheduleTilt = (element, rotation) => {
      activeElement = element
      nextRotation = rotation
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(applyTilt)
    }

    const resetTilt = (element) => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      animationFrame = null
      activeElement = null
      element.style.setProperty('--tilt-rotate-x', '0deg')
      element.style.setProperty('--tilt-rotate-y', '0deg')
    }

    const handlePointerEnter = (event) => {
      if (!canTilt()) return
      const element = event.target.closest(TILT_SELECTOR)
      if (!element) return
      element.style.setProperty('--tilt-scale', HOVER_SCALE)
      element.style.setProperty('--tilt-perspective', '900px')
      activeElement = element
    }

    const handlePointerMove = (event) => {
      if (!canTilt()) return
      const element = event.target.closest(TILT_SELECTOR)
      if (!element) return
      const bounds = element.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width
      const y = (event.clientY - bounds.top) / bounds.height
      scheduleTilt(element, {
        x: (0.5 - y) * MAX_ROTATION,
        y: (x - 0.5) * MAX_ROTATION,
      })
    }

    const handlePointerLeave = (event) => {
      const element = event.target.closest(TILT_SELECTOR)
      if (!element || element.contains(event.relatedTarget)) return
      resetTilt(element)
      element.style.setProperty('--tilt-scale', '1')
    }

    document.addEventListener('pointerover', handlePointerEnter)
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerout', handlePointerLeave)

    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
      document.removeEventListener('pointerover', handlePointerEnter)
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerout', handlePointerLeave)
    }
  }, [])
}

export default useTilt