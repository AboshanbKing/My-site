import { useEffect, useRef } from 'react'

const COLOR = '56, 214, 255'
const CAMERA = 1600
const SPREAD_Z = 800

function SiteBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let spreadX = 0
    let spreadY = 0
    let linkDistance = 0
    let points = []
    let animationFrame = 0
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const createPoints = () => {
      const count = width < 700 ? 45 : 90
      spreadX = width * 1.1
      spreadY = height * 1.1
      linkDistance = Math.cbrt((spreadX * spreadY * SPREAD_Z) / count) * 1.05
      points = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: (Math.random() - 0.5) * SPREAD_Z,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        sx: 0,
        sy: 0,
        scale: 0,
      }))
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const widthChanged = window.innerWidth !== width
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      if (widthChanged || points.length === 0) createPoints()
    }

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height)
      mouse.x += (mouse.targetX - mouse.x) * 0.04
      mouse.y += (mouse.targetY - mouse.y) * 0.04

      const angleY = Math.sin(time * 0.00006) * 0.35 + mouse.x * 0.5
      const angleX = Math.sin(window.scrollY * 0.0008) * 0.25 - mouse.y * 0.3
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const centerX = width / 2
      const centerY = height / 2
      const halfX = spreadX / 2
      const halfY = spreadY / 2
      const halfZ = SPREAD_Z / 2

      points.forEach((point) => {
        if (!reducedMotion) {
          point.x += point.vx
          point.y += point.vy
          point.z += point.vz
          if (point.x > halfX || point.x < -halfX) point.vx *= -1
          if (point.y > halfY || point.y < -halfY) point.vy *= -1
          if (point.z > halfZ || point.z < -halfZ) point.vz *= -1
        }
        const x1 = point.x * cosY + point.z * sinY
        const z1 = -point.x * sinY + point.z * cosY
        const y2 = point.y * cosX - z1 * sinX
        const z2 = point.y * sinX + z1 * cosX
        const depth = CAMERA + z2
        const scale = depth > 200 ? Math.min(2.2, CAMERA / depth) : 0
        point.sx = centerX + x1 * scale
        point.sy = centerY + y2 * scale
        point.scale = scale
      })

      const maxDistanceSquared = linkDistance * linkDistance
      ctx.lineWidth = 0.7
      for (let i = 0; i < points.length; i += 1) {
        const a = points[i]
        if (a.scale === 0) continue
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j]
          if (b.scale === 0) continue
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dz = a.z - b.z
          const distanceSquared = dx * dx + dy * dy + dz * dz
          if (distanceSquared > maxDistanceSquared) continue
          const closeness = 1 - Math.sqrt(distanceSquared) / linkDistance
          const depthAlpha = Math.min(1, ((a.scale + b.scale) / 2) * 0.7)
          ctx.strokeStyle = `rgba(${COLOR}, ${(closeness * 0.4 * depthAlpha).toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.sx, a.sy)
          ctx.lineTo(b.sx, b.sy)
          ctx.stroke()
        }
      }

      points.forEach((point) => {
        if (point.scale === 0) return
        const alpha = Math.min(0.95, Math.max(0.2, (point.scale - 0.5) * 0.9))
        ctx.beginPath()
        ctx.arc(point.sx, point.sy, 1.3 * point.scale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${COLOR}, ${alpha.toFixed(3)})`
        ctx.fill()
      })

      if (!reducedMotion) animationFrame = requestAnimationFrame(draw)
    }

    const handleMouseMove = (event) => {
      mouse.targetX = event.clientX / window.innerWidth - 0.5
      mouse.targetY = event.clientY / window.innerHeight - 0.5
    }

    resize()
    if (reducedMotion) draw(0)
    else animationFrame = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="site-background" aria-hidden="true" />
}

export default SiteBackground