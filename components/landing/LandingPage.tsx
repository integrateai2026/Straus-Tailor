'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from './icons'
import { garmentCategories, alterationCategories } from './data'

gsap.registerPlugin(ScrollTrigger)

// ── Design tokens ────────────────────────────────────────────────────────────
const B  = '#6B1A2C'   // burgundy
const BD = '#4A0F1E'   // burgundy deep
const BS = '#F4E8EA'   // burgundy soft
const CR = '#F7F3EC'   // cream
const NK = '#17171c'   // near black
const MONO = '"Space Grotesk", Inter, system-ui, sans-serif'
const BODY = 'Inter, system-ui, sans-serif'
const DANCE = '"Dancing Script", var(--font-dancing), cursive'

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const navRef  = useRef<HTMLElement>(null)
  const router  = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive]     = useState('home')

  useEffect(() => {
    // Slide nav down on mount
    gsap.from(navRef.current, { y: -80, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.2 })

    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Highlight active section
    const sections = ['home','services','about','reviews','contact']
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.3 }
    )
    sections.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => { window.removeEventListener('scroll', onScroll); obs.disconnect() }
  }, [])

  return (
    <nav ref={navRef} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px clamp(16px, 4vw, 48px)',
      background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0)',
      backdropFilter: scrolled ? 'saturate(180%) blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid #f2f2f2' : '1px solid transparent',
      transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      fontFamily: BODY,
    }}>
      <a href="#home" style={{ display: 'flex', alignItems: 'baseline', gap: 8, textDecoration: 'none', color: scrolled ? NK : '#fff' }}>
        <span style={{ fontFamily: DANCE, fontSize: 28, color: B, fontWeight: 600, lineHeight: 1 }}>Straus</span>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase' }}>Tailor Shop</span>
      </a>

      <div className="landing-nav-links">
        {['Home','Services','About','Reviews','Contact'].map(item => {
          const id = item.toLowerCase()
          return (
            <a key={id} href={`#${id}`} style={{
              fontSize: 14, color: scrolled ? NK : '#fff', textDecoration: 'none',
              opacity: active === id ? 1 : 0.65,
              borderBottom: active === id ? `1.5px solid ${B}` : '1.5px solid transparent',
              paddingBottom: 2,
              transition: 'opacity 200ms ease, border-color 200ms ease',
              fontFamily: BODY,
            }}>{item}</a>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={() => router.push('/staff')} style={{
          background: 'transparent',
          border: `1px solid ${scrolled ? NK + '30' : 'rgba(255,255,255,0.35)'}`,
          color: scrolled ? NK : '#fff',
          borderRadius: 32, padding: '8px 14px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: BODY, display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 200ms ease, border-color 200ms ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = scrolled ? NK + '0a' : 'rgba(255,255,255,0.12)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="nav-staff-text">Staff</span>
        </button>
        <a href="tel:+17019298262" className="nav-phone-pad" style={{
          background: B, color: '#fff', borderRadius: 32,
          fontSize: 13, fontWeight: 500, textDecoration: 'none',
          fontFamily: BODY, display: 'inline-flex', alignItems: 'center', gap: 7,
          transition: 'background 200ms ease', whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = BD}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = B}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
          </svg>
          <span className="nav-phone-text">(701) 929-8262</span>
        </a>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  // Wedding dress
  { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80', pos: 'center 30%' },
  // Suit — man in dark suit (confirmed)
  { url: 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=2000&q=80', pos: 'center 25%' },
  // Dress shirt — man in white dress shirt
  { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=2000&q=80', pos: 'center 20%' },
  // Formal / prom dress
  { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80', pos: 'center 20%' },
  // Winter coat — woman in long coat
  { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=2000&q=80', pos: 'center 20%' },
  // Regular pants / jeans
  { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=2000&q=80', pos: 'center 30%' },
  // Casual shirt
  { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=80', pos: 'center 25%' },
  // Winter jacket
  { url: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=2000&q=80', pos: 'center 25%' },
  // Second suit — businessman
  { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=80', pos: 'center 15%' },
]

const SLIDE_DURATION = 5000   // ms each slide shows
const ZOOM_SCALE     = 1.10   // Ken Burns end scale
const FADE_DURATION  = 1.1    // crossfade seconds

function Hero() {
  const slideRefs  = useRef<(HTMLDivElement | null)[]>([])
  const currentRef = useRef(0)

  const tagRef     = useRef<HTMLDivElement>(null)
  const title1Ref  = useRef<HTMLSpanElement>(null)
  const title2Ref  = useRef<HTMLSpanElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const ctaRef     = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)

  // Start Ken Burns zoom on a slide element
  const startZoom = (el: HTMLDivElement) => {
    gsap.killTweensOf(el, 'scale')
    gsap.fromTo(el, { scale: 1 }, { scale: ZOOM_SCALE, duration: SLIDE_DURATION / 1000 + FADE_DURATION, ease: 'none' })
  }

  useEffect(() => {
    // ── Entrance text animations ────────────────────────────────
    gsap.set([tagRef.current, title1Ref.current, title2Ref.current, taglineRef.current, ctaRef.current, cardsRef.current], { opacity: 0 })
    gsap.set([title1Ref.current, title2Ref.current], { y: 70 })
    gsap.set([tagRef.current, taglineRef.current, ctaRef.current], { y: 20 })
    gsap.set(cardsRef.current, { y: 60 })
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to(tagRef.current,    { opacity: 1, y: 0, duration: 0.6 }, 0.4)
      .to(title1Ref.current, { opacity: 1, y: 0, duration: 0.9 }, 0.6)
      .to(title2Ref.current, { opacity: 1, y: 0, duration: 0.9 }, 0.75)
      .to(taglineRef.current,{ opacity: 1, y: 0, duration: 0.7 }, 1.0)
      .to(ctaRef.current,    { opacity: 1, y: 0, duration: 0.7 }, 1.15)
      .to(cardsRef.current,  { opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.4)' }, 1.3)

    // ── Slideshow ───────────────────────────────────────────────
    // Show first slide
    const first = slideRefs.current[0]
    if (first) { gsap.set(first, { opacity: 1 }); startZoom(first) }

    const advance = () => {
      const prev = currentRef.current
      const next = (prev + 1) % HERO_SLIDES.length
      const prevEl = slideRefs.current[prev]
      const nextEl = slideRefs.current[next]

      if (nextEl) {
        gsap.set(nextEl, { scale: 1 })          // reset zoom
        gsap.to(nextEl, { opacity: 1, duration: FADE_DURATION, ease: 'power1.inOut' })
        startZoom(nextEl)
      }
      if (prevEl) {
        gsap.to(prevEl, { opacity: 0, duration: FADE_DURATION, ease: 'power1.inOut' })
      }
      currentRef.current = next
    }

    const timer = setInterval(advance, SLIDE_DURATION)
    return () => { clearInterval(timer); gsap.killTweensOf(slideRefs.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id="home" style={{
      position: 'relative', minHeight: 'min(840px, 96vh)',
      background: '#0c0c0e', color: '#fff', overflow: 'hidden',
    }}>
      {/* Slides — all stacked, only current is visible */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={i}
          ref={el => { slideRefs.current[i] = el }}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.url})`,
            backgroundSize: 'cover', backgroundPosition: slide.pos,
            filter: 'brightness(0.48) saturate(0.75)',
            opacity: 0, willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `linear-gradient(180deg, rgba(12,12,14,0.45) 0%, rgba(12,12,14,0.2) 40%, rgba(12,12,14,0.88) 100%)`,
      }}/>

      <div className="landing-hero-pad" style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
        <div ref={tagRef} style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.3px', textTransform: 'uppercase', color: '#E6CDD2', marginBottom: 28 }}>
          Master Tailor · Serving Fargo for 10+ Years
        </div>

        <h1 style={{ margin: '0 auto 24px', lineHeight: 0.93 }}>
          <span ref={title1Ref} style={{ display: 'block', fontFamily: DANCE, fontWeight: 600, fontSize: 'clamp(80px, 12vw, 172px)', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>Straus</span>
          <span ref={title2Ref} style={{ display: 'block', fontFamily: DANCE, fontWeight: 600, fontSize: 'clamp(80px, 12vw, 172px)', color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>Tailor Shop</span>
        </h1>

        <div ref={taglineRef} style={{
          display: 'inline-flex', alignItems: 'center', gap: 18,
          fontFamily: BODY, fontSize: 18, color: '#E6CDD2', marginBottom: 56
        }}>
          <span style={{ width: 44, height: 1, background: B, flexShrink: 0 }}/>
          Trusted Alterations for Every Occasion
          <span style={{ width: 44, height: 1, background: B, flexShrink: 0 }}/>
        </div>

        <div ref={ctaRef} style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
          <a href="#services" style={{
            background: B, color: '#fff', borderRadius: 32,
            padding: '14px 30px', fontSize: 15, fontWeight: 500, textDecoration: 'none',
            fontFamily: BODY, transition: 'background 200ms ease, transform 200ms ease',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = BD; el.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = B; el.style.transform = 'translateY(0)' }}>
            Explore services
          </a>
          <a href="#contact" style={{
            color: '#fff', fontSize: 15, fontWeight: 500,
            textDecoration: 'underline', textUnderlineOffset: 4, fontFamily: BODY,
            transition: 'opacity 200ms ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.75'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}>
            Walk-ins welcome
          </a>
        </div>
      </div>

      {/* Info cards */}
      <div ref={cardsRef} className="landing-cards" style={{
        position: 'relative', maxWidth: 1180, margin: '0 auto',
        padding: '0 clamp(16px,4vw,48px)',
        transform: 'translateY(50%)', display: 'grid',
        gap: 14, zIndex: 4,
      }}>
        <div style={{ background: NK, color: '#fff', borderRadius: 22, padding: '36px 40px' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', color: BS, marginBottom: 22 }}>Working Hours</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 32px', fontSize: 15, fontFamily: BODY }}>
            <div>Monday – Friday</div><div style={{ textAlign: 'right', color: '#E6CDD2' }}>9 am – 5 pm</div>
            <div>Saturday</div><div style={{ textAlign: 'right', color: '#E6CDD2', opacity: 0.5 }}>Closed</div>
            <div>Sunday</div><div style={{ textAlign: 'right', color: '#E6CDD2', opacity: 0.5 }}>Closed</div>
          </div>
        </div>
        <div style={{
          background: '#fff', color: NK, borderRadius: 22,
          padding: '36px 40px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: BS, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
            </svg>
          </div>
          <div style={{ fontFamily: BODY, fontSize: 22, fontWeight: 500, color: B, marginBottom: 6 }}>(701) 929-8262</div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', color: '#75758a' }}>Walk-ins · No appointment</div>
        </div>
      </div>
    </section>
  )
}

// ── Garment category accordion card ──────────────────────────────────────────
// Uses CSS grid-template-rows trick: animates between 0fr and 1fr for
// reliable height animation without GSAP race conditions.
function GarmentCategoryCard({ icon, label, items }: { icon: string; label: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: open ? BS : '#fff',
      border: `1px solid ${open ? B + '55' : '#eceae5'}`,
      borderRadius: 18,
      transition: 'background 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
      boxShadow: open ? `0 4px 24px ${B}18` : 'none',
    }}>
      {/* Header button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 18,
          padding: '22px 24px', textAlign: 'left',
        }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: open ? '#fff' : BS,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 250ms ease',
        }}>
          <Icon name={icon} size={26} stroke={B}/>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontSize: 15, fontWeight: 600, color: NK, lineHeight: 1.3, marginBottom: 3 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.28px', textTransform: 'uppercase', color: '#75758a' }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        </div>

        <svg
          width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke={B} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 320ms cubic-bezier(0.2,0.8,0.2,1)' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expandable body — CSS grid trick, no GSAP, no race conditions */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 320ms cubic-bezier(0.2,0.8,0.2,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="landing-cat-items" style={{ padding: '2px 24px 22px', display: 'grid', gap: '9px 14px' }}>
            {items.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: BODY, fontSize: 13.5, color: NK, lineHeight: 1.4 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: B, flexShrink: 0 }}/>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────
function ServiceTile({ icon, label }: { icon: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? B : '#fff',
        color: hovered ? '#fff' : NK,
        border: `1px solid ${hovered ? B : '#eceae5'}`,
        borderRadius: 14, padding: '18px 8px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
        textAlign: 'center', minHeight: 118,
        transition: 'all 220ms ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
        boxShadow: hovered ? `0 8px 24px ${B}30` : 'none',
      }}>
      <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={30} stroke={hovered ? '#fff' : B}/>
      </div>
      <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 500, lineHeight: 1.25 }}>{label}</div>
    </div>
  )
}

function Services() {
  const sectionRef    = useRef<HTMLDivElement>(null)
  const headerRef     = useRef<HTMLDivElement>(null)
  const garmentRef    = useRef<HTMLDivElement>(null)
  const alterRef      = useRef<HTMLDivElement>(null)
  const garGridRef    = useRef<HTMLDivElement>(null)
  const altGridRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slide-only animations — no opacity so content is always visible
      gsap.from(headerRef.current, {
        y: 40, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 92%', once: true },
      })
      gsap.from(garmentRef.current, {
        y: 30, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: garmentRef.current, start: 'top 92%', once: true },
      })
      if (garGridRef.current) {
        gsap.from(Array.from(garGridRef.current.children), {
          y: 18, scale: 0.97,
          stagger: 0.025, duration: 0.4, ease: 'power2.out',
          scrollTrigger: { trigger: garGridRef.current, start: 'top 92%', once: true },
        })
      }
      gsap.from(alterRef.current, {
        y: 30, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: alterRef.current, start: 'top 92%', once: true },
      })
      if (altGridRef.current) {
        gsap.from(Array.from(altGridRef.current.children), {
          y: 18, scale: 0.97,
          stagger: 0.02, duration: 0.4, ease: 'power2.out',
          scrollTrigger: { trigger: altGridRef.current, start: 'top 92%', once: true },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="services" ref={sectionRef} style={{ background: CR, padding: 'clamp(120px, 22vw, 240px) clamp(16px, 4vw, 48px) clamp(60px, 8vw, 120px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.32px', textTransform: 'uppercase', color: B, marginBottom: 18 }}>Only the finest craftsmanship</div>
          <h2 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1.05, letterSpacing: '-1.2px', margin: '0 0 18px', color: NK }}>
            Amazing quality, every stitch.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 'clamp(15px,2vw,18px)', lineHeight: 1.5, color: '#3b3b40', maxWidth: 620, margin: '0 auto' }}>
            From wedding gowns to weekend jeans — every garment that comes through our door is treated with patience and precision.
          </p>
        </div>

        {/* ── Garments ── */}
        <div ref={garmentRef} style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${NK}22`, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: NK, opacity: 0.4 }}>01</span>
            <h3 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(22px,3vw,30px)', letterSpacing: '-0.4px', margin: 0, color: NK }}>Garments we tailor</h3>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>6 categories</span>
          </div>
          <div ref={garGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 14, alignItems: 'start' }}>
            {garmentCategories.map((cat, i) => <GarmentCategoryCard key={i} {...cat}/>)}
          </div>
        </div>

        {/* ── Alterations ── */}
        <div ref={alterRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid ${NK}22`, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: NK, opacity: 0.4 }}>02</span>
            <h3 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(22px,3vw,30px)', letterSpacing: '-0.4px', margin: 0, color: NK }}>Alterations & repairs</h3>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>7 categories</span>
          </div>
          <div ref={altGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 14, alignItems: 'start' }}>
            {alterationCategories.map((cat, i) => <GarmentCategoryCard key={i} {...cat}/>)}
          </div>
        </div>

        <div style={{ marginTop: 64, textAlign: 'center' }}>
          <p style={{ fontFamily: BODY, fontSize: 16, color: '#3b3b40', marginBottom: 20 }}>
            Don't see what you need? We've probably done it before.
          </p>
          <a href="tel:+17019298262" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: NK, color: '#fff', borderRadius: 32,
            padding: '14px 28px', fontSize: 15, fontWeight: 500, textDecoration: 'none',
            fontFamily: BODY, transition: 'background 200ms ease, transform 200ms ease',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = '#2a2a31'; el.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = NK; el.style.transform = 'translateY(0)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
            </svg>
            Call Us
          </a>
        </div>
      </div>
    </section>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────
function StatCounter({ target, label, suffix = '' }: { target: string; label: string; suffix?: string }) {
  const numRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.from(numRef.current, {
      y: 10, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: numRef.current, start: 'top 95%', once: true },
    })
  }, [])
  return (
    <div>
      <div ref={numRef} style={{ fontFamily: BODY, fontSize: 40, fontWeight: 300, color: B, lineHeight: 1, marginBottom: 6 }}>
        {target}{suffix}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>{label}</div>
    </div>
  )
}

function About() {
  const imgRef  = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.from(imgRef.current, {
      x: -50, duration: 1.0, ease: 'power2.out',
      scrollTrigger: { trigger: imgRef.current, start: 'top 92%', once: true },
    })
    gsap.from(textRef.current, {
      x: 50, duration: 1.0, ease: 'power2.out',
      scrollTrigger: { trigger: textRef.current, start: 'top 92%', once: true },
    })
  }, [])

  return (
    <section id="about" style={{ background: '#fff', padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,48px)' }}>
      <div className="landing-about" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', alignItems: 'center' }}>
        <div ref={imgRef} className="landing-about-img" style={{
          borderRadius: 22, overflow: 'hidden', aspectRatio: '4/5',
          backgroundImage: 'url(/pabitra.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center top',
          maxHeight: 480,
        }}/>
        <div ref={textRef}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.32px', textTransform: 'uppercase', color: B, marginBottom: 18 }}>About the shop</div>
          <h2 style={{ fontFamily: DANCE, fontWeight: 600, fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.15, margin: '0 0 28px', color: NK }}>
            A Note From Pabitra
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.7, color: '#3b3b40', margin: '0 0 18px' }}>
            Hello, I'm Pabitra, the owner of Straus Tailor Shop. I'm originally from Bhutan, and I have been sewing for more than 20 years.
          </p>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.7, color: '#3b3b40', margin: '0 0 18px' }}>
            At Straus Tailor Shop, we love helping customers feel confident in the pieces that matter to them. Sometimes it is a wedding dress, a suit, a uniform, everyday clothing, or even a special project for the home.
          </p>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.7, color: '#3b3b40', margin: '0 0 18px' }}>
            Over the years, the shop has grown, and I am grateful to work alongside amazing tailors who share the same care and pride in their work. What we enjoy most is meeting our customers, hearing their stories, and building relationships that go beyond business.
          </p>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.7, color: '#3b3b40', margin: '0 0 32px' }}>
            Thank you for trusting us with your clothing and your special moments. We are always happy to see you.
          </p>
          <div className="landing-stats" style={{ display: 'grid', gap: 24, paddingTop: 28, borderTop: `1px solid ${NK}1a` }}>
            <StatCounter target="20+" label="Years of sewing experience"/>
            <StatCounter target="Walk‑ins" label="No appointment needed"/>
            <StatCounter target="2 wks" label="Typical turnaround"/>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Google Reviews carousel ───────────────────────────────────────────────────
const GOOGLE_REVIEWS = [
  { name: 'Alexia Olson',           text: 'After having an awful experience at the place in the mall, I brought my wedding dress here and they were able to make all the changes I needed. They provided recommendations and were very efficient and had great customer service. I won\'t be going anywhere else. So so satisfied!' },
  { name: 'Katie Ressemann',        text: 'I visited Straus for the first time to get some alterations done on a bridesmaid dress. I totally procrastinated and needed it done in a week. Not only did they say no problem, they actually had it done in 3 days! They did a great job with the alterations and the price was totally fair as well. I will definitely be back for future needs!' },
  { name: 'Alyssa Anderson',        text: 'She did such a good job and was so fast! I needed the chest altered on my wedding dress. I called Monday before the wedding and she got me in and I got it back on Wednesday and I felt so much more comfortable and it looked great!' },
  { name: 'Ganistipan Animikii',    text: 'I bring all my suits there. Once you\'ve worn a tailored suit two things will happen: You will get the rest of them tailored. You will begin to notice how other men need to go get their suits tailored.' },
  { name: 'Joseph Fiedler',         text: 'I had never been to a tailor shop in Fargo. I searched a place with great reviews. I agree with the reviews. Excellent results and reasonably priced.' },
  { name: 'W J',                    text: 'I have been taking my clothes here for years. They are the best place to go in the Fargo Moorhead area for alterations hands down. Very courteous, excellent service, and the finished product has always been perfect. Thank you!' },
  { name: 'Robin Johansen',         text: 'Pabitra did a great job hemming my formal dress for my husband\'s military ball! She was kind and very professional. She also adjusted my husband\'s military jacket and it looks and fits great! I highly recommend Straus Tailor Shop.' },
  { name: 'Linda Dietz',            text: 'Pabitra took my wedding dress that was almost ruined, and made it look beautiful and fit like a glove! I cannot give her enough praise! And her prices are more than fair.' },
  { name: 'Darsh Desai',            text: 'Amazing service. Hands down the best tailor in town. Every new suit/shirt/jeans I purchase goes to get tailored there first. Always above expectation, always done in a timely fashion.' },
  { name: 'Derek Morton',           text: 'My backpack was all ripped up and she fixed it very quickly. I highly recommend this place — she is a very good person to deal with.' },
  { name: 'Ryan T',                 text: 'The lady who helped me couldn\'t have been nicer and helped adjust a pair of pants for me. The cost was minimal and the turnaround was only 2 days even though I let them know I wasn\'t in a hurry.' },
  { name: 'Jordan Gleason',         text: 'Patched a flannel shirt and Carhartt jacket for me. Did very nice work at a reasonable rate. Very friendly as well.' },
  { name: 'Vinnan Tamil',           text: 'Had my dress blues rank updated. Good place to get your military clothes altered.' },
  { name: 'Kelsey Duffney-Aanerud', text: 'The owner did an AMAZING job!! I\'m definitely recommending her to anyone that needs any alterations!' },
  { name: 'Chad Herring',           text: 'Pabitra has always done fantastic work for my wife and I. She has done mens, women\'s and kids alterations for us and its been perfect every time!!!' },
]

function Stars() {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="15" height="15" viewBox="0 0 24 24" fill="#FBBC05">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

const AVATAR_COLORS = ['#6B1A2C','#2D4A7A','#1A5C3A','#7A4A1A','#4A1A6B','#1A4A5C']

function Reviews() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef     = useRef<HTMLDivElement>(null)
  const [idx, setIdx]       = useState(0)
  const [cardW, setCardW]   = useState(360)
  const [visible, setVisible] = useState(3)
  const [paused, setPaused] = useState(false)
  const idxRef  = useRef(0)
  const visRef  = useRef(3)
  const cardRef = useRef(360)
  const startX  = useRef(0)
  const dragging = useRef(false)

  // Calculate card width from container
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const v = window.innerWidth < 640 ? 1 : window.innerWidth < 960 ? 2 : 3
      const w = containerRef.current.offsetWidth / v
      setVisible(v); visRef.current = v
      setCardW(w);   cardRef.current = w
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const maxIdx = Math.max(0, GOOGLE_REVIEWS.length - visible)

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(i, Math.max(0, GOOGLE_REVIEWS.length - visRef.current)))
    idxRef.current = next
    setIdx(next)
    if (trackRef.current) {
      gsap.to(trackRef.current, { x: -(next * cardRef.current), duration: 0.45, ease: 'power2.out' })
    }
  }

  // Auto-advance
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      const max = Math.max(0, GOOGLE_REVIEWS.length - visRef.current)
      goTo(idxRef.current >= max ? 0 : idxRef.current + 1)
    }, 4000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true; startX.current = e.clientX
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    const diff = startX.current - e.clientX
    if (Math.abs(diff) > 40) goTo(diff > 0 ? idxRef.current + 1 : idxRef.current - 1)
  }

  const ArrowBtn = ({ dir }: { dir: 'prev' | 'next' }) => {
    const disabled = dir === 'prev' ? idx === 0 : idx >= maxIdx
    return (
      <button
        className="carousel-arrow"
        onClick={() => goTo(dir === 'prev' ? idx - 1 : idx + 1)}
        disabled={disabled}
        style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          [dir === 'prev' ? 'left' : 'right']: -20,
          zIndex: 10, width: 40, height: 40, borderRadius: '50%',
          background: disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 200ms ease',
        }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
        onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}/>
        </svg>
      </button>
    )
  }

  return (
    <section id="reviews" style={{ background: NK, padding: 'clamp(60px,8vw,100px) clamp(16px,4vw,48px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 44 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: BS, marginBottom: 14 }}>What customers say</div>
            <h2 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-0.6px', margin: 0, color: '#fff' }}>
              Trusted by Fargo for over a decade.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 20px' }}>
            <GoogleG/>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: BODY, fontSize: 28, fontWeight: 600, color: '#fff', lineHeight: 1 }}>4.9</span>
                <Stars/>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.28px', textTransform: 'uppercase', color: '#93939f', marginTop: 3 }}>Google Reviews</div>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div style={{ position: 'relative', padding: '4px 28px' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <ArrowBtn dir="prev"/>
          <div ref={containerRef} style={{ overflow: 'hidden' }}>
            <div ref={trackRef}
              style={{ display: 'flex', willChange: 'transform', cursor: 'grab', userSelect: 'none' }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => { dragging.current = false }}
            >
              {GOOGLE_REVIEWS.map((r, i) => (
                <div key={i} style={{ flex: `0 0 ${cardW}px`, padding: '0 8px', boxSizing: 'border-box' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, padding: '22px', height: '100%', boxSizing: 'border-box',
                    display: 'flex', flexDirection: 'column', gap: 14,
                    transition: 'background 200ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.09)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: BODY, fontSize: 13, fontWeight: 700, color: '#fff',
                        }}>{r.name[0]}</div>
                        <div>
                          <div style={{ fontFamily: BODY, fontSize: 13.5, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{r.name}</div>
                          <Stars/>
                        </div>
                      </div>
                      <GoogleG/>
                    </div>
                    <p style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: 0, flexGrow: 1 }}>
                      "{r.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ArrowBtn dir="next"/>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 28 }}>
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === idx ? 24 : 7, height: 7, borderRadius: 9999, border: 0, padding: 0, cursor: 'pointer',
              background: i === idx ? B : 'rgba(255,255,255,0.25)',
              transition: 'all 300ms cubic-bezier(0.2,0.8,0.2,1)',
            }}/>
          ))}
        </div>

        {/* See all on Google */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a
            href="https://www.google.com/maps/search/Straus+Tailor+Shop+Fargo+ND"
            target="_blank" rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 32,
              padding: '12px 24px', fontSize: 14, fontWeight: 500,
              textDecoration: 'none', fontFamily: BODY,
              transition: 'background 200ms ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'}
          >
            <GoogleG/>
            See all reviews on Google
          </a>
        </div>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const formRef    = useRef<HTMLFormElement>(null)
  const infoRef    = useRef<HTMLDivElement>(null)
  const loadedAt   = useRef<number>(Date.now())
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    loadedAt.current = Date.now()
    if (formRef.current) {
      gsap.from(Array.from(formRef.current.children), {
        y: 20, stagger: 0.1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: formRef.current, start: 'top 92%', once: true },
      })
    }
    gsap.from(infoRef.current, {
      x: 30, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: infoRef.current, start: 'top 92%', once: true },
    })
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: '', loadedAt: loadedAt.current }),
      })
      const data = await res.json()
      if (!res.ok) { setStatus('error'); setErrorMsg(data.error ?? 'Something went wrong.'); return }
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
      setErrorMsg('Could not send message. Please try again.')
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', background: '#fafafa', border: '1px solid #e5e7eb',
    borderRadius: 8, padding: '14px 16px', fontSize: 14,
    fontFamily: BODY, color: NK, outline: 'none',
    transition: 'border-color 200ms ease',
  }

  return (
    <section id="contact" style={{ background: '#fff', padding: 'clamp(60px,8vw,120px) clamp(16px,4vw,48px)' }}>
      <div className="landing-contact" style={{ maxWidth: 1180, margin: '0 auto', display: 'grid' }}>
        <form ref={formRef} onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Honeypot — hidden from real users, bots fill it and get silently rejected */}
          <input name="website" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }} readOnly/>

          <input placeholder="Your name" value={form.name} onChange={up('name')} required style={inp} onFocus={e => (e.currentTarget.style.borderColor = B)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}/>
          <input type="email" placeholder="Email address" value={form.email} onChange={up('email')} required style={inp} onFocus={e => (e.currentTarget.style.borderColor = B)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}/>
          <textarea placeholder="Tell us what you'd like tailored…" value={form.message} onChange={up('message')} required rows={5} style={{ ...inp, resize: 'vertical' }} onFocus={e => (e.currentTarget.style.borderColor = B)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}/>

          {status === 'error' && (
            <div style={{ fontFamily: BODY, fontSize: 13, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={status === 'sending' || status === 'sent'} style={{
            background: status === 'sent' ? '#3b8a4f' : B, color: '#fff', border: 0, borderRadius: 32,
            padding: '14px 28px', fontSize: 15, fontWeight: 500,
            cursor: status === 'sending' || status === 'sent' ? 'default' : 'pointer',
            fontFamily: BODY, alignSelf: 'flex-start', marginTop: 10,
            transition: 'background 200ms ease, transform 200ms ease',
            opacity: status === 'sending' ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (status === 'idle') { const el = e.currentTarget as HTMLButtonElement; el.style.background = BD; el.style.transform = 'translateY(-2px)' }}}
          onMouseLeave={e => { if (status === 'idle') { const el = e.currentTarget as HTMLButtonElement; el.style.background = B; el.style.transform = 'translateY(0)' }}}>
            {status === 'sending' ? 'Sending…' : status === 'sent' ? "✓ Message sent — we'll be in touch!" : 'Send message'}
          </button>
        </form>

        <div ref={infoRef}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.32px', textTransform: 'uppercase', color: B, marginBottom: 18 }}>Contact us</div>
          <h2 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.1, letterSpacing: '-0.8px', margin: '0 0 28px', color: NK }}>
            Bring us your garment.<br/>We'll take it from there.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: '#3b3b40', margin: '0 0 36px' }}>
            Walk-ins welcome during shop hours — no appointment needed. Not sure if we can do something? Bring it in or give us a call. We work on pretty much everything.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Visit',  value: '1326 25th St S, Suite B\nFargo, ND 58103' },
              { label: 'Call',   value: '(701) 929-8262' },
              { label: 'Email',  value: 'Straustailorshop@gmail.com' },
              { label: 'Hours',  value: 'Mon – Fri · 9 am – 5 pm\nSaturday & Sunday · Closed' },
            ].map(row => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 16, paddingBottom: 16, borderBottom: '1px solid #f2f2f2' }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>{row.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: NK, whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{row.value}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              {[
                { href: 'https://www.facebook.com/straustailorshop/', label: 'Facebook', icon: <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 5 3.66 9.16 8.44 9.93v-7.02H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.91h-2.33V22c4.78-.77 8.44-4.93 8.44-9.93z"/> },
                { href: 'https://www.tiktok.com/@straustailorshop', label: 'TikTok', icon: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.86a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1.84-.31z"/> },
              ].map(btn => (
                <a key={btn.label} href={btn.href} target="_blank" rel="noopener" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  border: `1px solid ${NK}22`, borderRadius: 32, color: NK,
                  textDecoration: 'none', fontSize: 13, fontWeight: 500, fontFamily: BODY,
                  transition: 'border-color 200ms ease, background 200ms ease',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = NK + '06'; el.style.borderColor = NK + '44' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = 'transparent'; el.style.borderColor = NK + '22' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">{btn.icon}</svg>
                  {btn.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.from(Array.from(ref.current.querySelectorAll<HTMLElement>('.footer-col')), {
      y: 20, stagger: 0.1, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 95%', once: true },
    })
  }, [])

  return (
    <footer ref={ref} style={{ background: NK, color: '#fff', padding: 'clamp(40px,6vw,64px) clamp(16px,4vw,48px) 36px', fontFamily: BODY }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div className="landing-footer" style={{ display: 'grid', paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="footer-col">
            <div style={{ fontFamily: DANCE, fontSize: 38, fontWeight: 600, color: BS, lineHeight: 1, marginBottom: 4 }}>Straus</div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', marginBottom: 22 }}>Tailor Shop</div>
            <p style={{ fontSize: 13, color: '#93939f', margin: 0, maxWidth: 300, lineHeight: 1.6 }}>
              Expert tailoring and alterations in Fargo with over 20 years of sewing experience. Walk-ins welcome, no appointment needed.
              <br/><br/>
              Thank you for trusting us with your clothing and your special moments. We are always happy to see you.
            </p>
          </div>
          <div className="footer-col">
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', marginBottom: 16 }}>Services</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Garments We Tailor', href: '#services' },
                { label: 'Alterations & Repairs', href: '#services' },
              ].map(x => (
                <li key={x.label}><a href={x.href} style={{ color: '#93939f', textDecoration: 'none', fontSize: 14, transition: 'color 200ms ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = BS}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#93939f'}>{x.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', marginBottom: 16 }}>Visit</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#93939f', lineHeight: 1.5 }}>
              <li>1326 25th St S</li><li>Suite B</li><li>Fargo, ND 58103</li>
              <li style={{ paddingTop: 4 }}><a href="tel:+17019298262" style={{ color: '#93939f', textDecoration: 'none' }}>(701) 929-8262</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', marginBottom: 16 }}>Hours</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#93939f', lineHeight: 1.5 }}>
              <li>Mon – Fri · 9 – 5</li><li>Saturday · Closed</li><li>Sunday · Closed</li>
            </ul>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 28, fontSize: 12, color: '#93939f' }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span>© 2026 Straus Tailor Shop. All rights reserved.</span>
            <a href="/privacy" style={{ color: '#93939f', textDecoration: 'none', transition: 'color 200ms ease' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = BS}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#93939f'}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#93939f', textDecoration: 'none', transition: 'color 200ms ease' }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = BS}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#93939f'}>Terms & Conditions</a>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[
              { href: 'https://www.facebook.com/straustailorshop/', label: 'Facebook' },
              { href: 'https://www.tiktok.com/@straustailorshop', label: 'TikTok' },
              { href: 'mailto:Straustailorshop@gmail.com', label: 'Email' },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener" style={{ color: '#93939f', textDecoration: 'none', transition: 'color 200ms ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = BS}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#93939f'}>{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Responsive CSS ────────────────────────────────────────────────────────────
const responsiveStyles = `
  /* Nav */
  .landing-nav-links  { display: flex; gap: 32px; align-items: center; }
  .nav-phone-text     { display: inline; }
  .nav-phone-pad      { padding: 10px 20px; }
  .nav-staff-text     { display: inline; }
  /* Hero */
  .landing-hero-pad   { padding: 180px 48px 220px; }
  .landing-cards      { grid-template-columns: 2fr 1fr; }
  /* About */
  .landing-about      { grid-template-columns: 1fr 1.2fr; gap: 80px; }
  .landing-about-img  { display: block; }
  .landing-stats      { grid-template-columns: repeat(3, 1fr); }
  /* Layout */
  .landing-contact    { grid-template-columns: 1fr 1fr; gap: 80px; }
  .landing-footer     { grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 56px; }
  .landing-cat-items  { grid-template-columns: 1fr 1fr; }
  /* Carousel */
  .carousel-arrow     { display: flex; }

  @media (max-width: 900px) {
    .landing-nav-links { display: none; }
    .landing-hero-pad  { padding: 130px 20px 160px; }
    .landing-cards     { grid-template-columns: 1fr; gap: 12px; }
    .landing-about     { grid-template-columns: 1fr; gap: 36px; }
    .landing-contact   { grid-template-columns: 1fr; gap: 40px; }
    .landing-footer    { grid-template-columns: 1fr 1fr; gap: 32px; }
    .landing-stats     { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  }

  @media (max-width: 600px) {
    .nav-phone-text    { display: none; }
    .nav-phone-pad     { padding: 10px 14px; }
    .nav-staff-text    { display: none; }
    .landing-hero-pad  { padding: 110px 16px 150px; }
    .landing-footer    { grid-template-columns: 1fr 1fr; gap: 24px; }
    .landing-cat-items { grid-template-columns: 1fr; }
    .landing-stats     { grid-template-columns: 1fr 1fr; gap: 16px; }
    .carousel-arrow    { display: none; }
  }

  @media (max-width: 400px) {
    .landing-footer    { grid-template-columns: 1fr; gap: 20px; }
    .landing-stats     { grid-template-columns: 1fr; gap: 12px; }
  }
`

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useEffect(() => {
    // Override dark theme for landing page
    const html = document.documentElement
    const body = document.body
    const prevHtmlBg = html.style.background
    const prevBodyBg = body.style.background
    const prevBodyColor = body.style.color
    html.style.background = '#ffffff'
    body.style.background = '#ffffff'
    body.style.color = NK
    return () => {
      html.style.background = prevHtmlBg
      body.style.background = prevBodyBg
      body.style.color = prevBodyColor
    }
  }, [])

  return (
    <div id="top" style={{ background: '#fff', color: NK, overflowX: 'hidden' }}>
      <style>{responsiveStyles}</style>
      <Nav/>
      <Hero/>
      <Services/>
      <About/>
      <Reviews/>
      <Contact/>
      <Footer/>
    </div>
  )
}
