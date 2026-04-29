'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface StaticStar {
  x: number
  y: number
  r: number
  baseAlpha: number
  alpha: number
  twinkleSpeed: number
  twinkleOffset: number
}

interface FallingStar {
  x: number
  y: number
  len: number
  speed: number
  angle: number   // radians from vertical (slight diagonal)
  alpha: number
  width: number
  reset: boolean
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let W = 0, H = 0
    let staticStars: StaticStar[] = []
    let fallingStars: FallingStar[] = []
    let frame = 0
    let rafId: number

    function resize() {
      W = canvas!.width  = window.innerWidth
      H = canvas!.height = window.innerHeight
      buildStars()
    }

    function buildStars() {
      const count = Math.floor((W * H) / 4000)
      staticStars = Array.from({ length: count }, () => {
        const base = randomBetween(0.05, 0.55)
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: randomBetween(0.3, 1.6),
          baseAlpha: base,
          alpha: base,
          twinkleSpeed: randomBetween(0.004, 0.018),
          twinkleOffset: Math.random() * Math.PI * 2,
        }
      })

      fallingStars = Array.from({ length: 28 }, () => makeFallingStar(true))
    }

    function makeFallingStar(scattered = false): FallingStar {
      return {
        x: Math.random() * W,
        y: scattered ? Math.random() * H : -60,
        len: randomBetween(40, 160),
        speed: randomBetween(1.8, 6.5),
        angle: randomBetween(-0.18, 0.18),
        alpha: randomBetween(0.35, 0.9),
        width: randomBetween(0.6, 2.0),
        reset: false,
      }
    }

    function drawStaticStars(t: number) {
      for (const s of staticStars) {
        s.alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * (s.baseAlpha * 0.7)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, s.alpha)})`
        ctx.fill()
      }
    }

    function drawFallingStars() {
      for (const s of fallingStars) {
        const dx = Math.sin(s.angle) * s.len
        const dy = Math.cos(s.angle) * s.len

        const grad = ctx.createLinearGradient(s.x, s.y, s.x - dx, s.y - dy)
        grad.addColorStop(0, `rgba(255,255,255,${s.alpha})`)
        grad.addColorStop(0.4, `rgba(210,210,255,${s.alpha * 0.4})`)
        grad.addColorStop(1, `rgba(180,180,255,0)`)

        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - dx, s.y - dy)
        ctx.strokeStyle = grad
        ctx.lineWidth = s.width
        ctx.lineCap = 'round'
        ctx.stroke()

        // tiny bright head
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.width * 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
        ctx.fill()

        // advance
        s.x += Math.sin(s.angle) * s.speed
        s.y += Math.cos(s.angle) * s.speed

        if (s.y > H + s.len || s.x < -s.len || s.x > W + s.len) {
          Object.assign(s, makeFallingStar())
        }
      }
    }

    function tick() {
      frame++
      ctx.clearRect(0, 0, W, H)

      // deep space gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0,   '#050508')
      bg.addColorStop(0.5, '#080810')
      bg.addColorStop(1,   '#060608')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      drawStaticStars(frame)
      drawFallingStars()

      rafId = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    tick()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
