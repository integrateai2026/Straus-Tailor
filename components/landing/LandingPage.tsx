'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from './icons'
import { garmentCategories, alterations, quotes } from './data'

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
      padding: '16px 48px',
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

      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
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
          borderRadius: 32, padding: '8px 18px',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          fontFamily: BODY,
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'background 200ms ease, border-color 200ms ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = scrolled ? NK + '0a' : 'rgba(255,255,255,0.12)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Staff
        </button>
        <a href="tel:+17019298262" style={{
          background: B, color: '#fff', borderRadius: 32,
          padding: '10px 20px', fontSize: 13, fontWeight: 500, textDecoration: 'none',
          fontFamily: BODY, display: 'inline-flex', alignItems: 'center', gap: 7,
          transition: 'background 200ms ease',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = BD}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = B}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
          </svg>
          (701) 929-8262
        </a>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const bgRef     = useRef<HTMLDivElement>(null)
  const tagRef    = useRef<HTMLDivElement>(null)
  const title1Ref = useRef<HTMLSpanElement>(null)
  const title2Ref = useRef<HTMLSpanElement>(null)
  const taglineRef= useRef<HTMLDivElement>(null)
  const ctaRef    = useRef<HTMLDivElement>(null)
  const cardsRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set initial hidden states via GSAP (not inline styles)
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

    // Parallax on scroll
    gsap.to(bgRef.current, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true },
    })
  }, [])

  return (
    <section id="home" style={{
      position: 'relative', minHeight: 'min(840px, 96vh)',
      background: '#0c0c0e', color: '#fff', overflow: 'hidden',
    }}>
      <div ref={bgRef} style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=2000&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center 30%',
        filter: 'brightness(0.5) saturate(0.8)',
        willChange: 'transform',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(12,12,14,0.5) 0%, rgba(12,12,14,0.25) 40%, rgba(12,12,14,0.88) 100%)`,
      }}/>

      <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', padding: '180px 48px 220px', textAlign: 'center' }}>
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
      <div ref={cardsRef} style={{
        position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '0 48px',
        transform: 'translateY(50%)', display: 'grid',
        gridTemplateColumns: '2fr 1fr', gap: 24, zIndex: 2,
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
function GarmentCategoryCard({ icon, label, items }: { icon: string; label: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    const el = bodyRef.current
    if (!el) { setOpen(o => !o); return }
    if (!open) {
      setOpen(true)
      gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.35, ease: 'power2.out' })
    } else {
      gsap.to(el, { height: 0, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => setOpen(false) })
    }
  }

  return (
    <div style={{
      background: open ? BS : '#fff',
      border: `1px solid ${open ? B + '40' : '#eceae5'}`,
      borderRadius: 18,
      overflow: 'hidden',
      transition: 'background 250ms ease, border-color 250ms ease',
      boxShadow: open ? `0 4px 20px ${B}14` : 'none',
    }}>
      <button onClick={toggle} style={{
        width: '100%', background: 'none', border: 0, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 18, padding: '24px 28px',
        textAlign: 'left',
      }}>
        {/* Icon circle */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: open ? '#fff' : BS,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 250ms ease',
        }}>
          <Icon name={icon} size={28} stroke={B}/>
        </div>

        {/* Label + count */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: BODY, fontSize: 16, fontWeight: 600, color: NK, lineHeight: 1.25, marginBottom: 4 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', color: '#75758a' }}>
            {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Chevron */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={B} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms ease' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expandable items */}
      {open && (
        <div ref={bodyRef} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '4px 28px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            {items.map(item => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: BODY, fontSize: 13.5, color: NK, lineHeight: 1.4,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: B, flexShrink: 0 }}/>
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
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
    <section id="services" ref={sectionRef} style={{ background: CR, padding: '220px 48px 120px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 80 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.32px', textTransform: 'uppercase', color: B, marginBottom: 18 }}>Only the finest craftsmanship</div>
          <h2 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(44px,5vw,64px)', lineHeight: 1.05, letterSpacing: '-1.2px', margin: '0 0 18px', color: NK }}>
            Amazing quality, every stitch.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 18, lineHeight: 1.5, color: '#3b3b40', maxWidth: 620, margin: '0 auto' }}>
            From wedding gowns to weekend jeans — every garment that comes through our door is treated with patience and precision.
          </p>
        </div>

        <div ref={garmentRef} style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 28, paddingBottom: 18, borderBottom: `1px solid ${NK}22` }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: NK, opacity: 0.4 }}>01</span>
            <h3 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 30, letterSpacing: '-0.4px', margin: 0, color: NK }}>Garments we tailor</h3>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>6 categories</span>
          </div>
          <div ref={garGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {garmentCategories.map((cat, i) => <GarmentCategoryCard key={i} {...cat}/>)}
          </div>
        </div>

        <div ref={alterRef}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 28, paddingBottom: 18, borderBottom: `1px solid ${NK}22` }}>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: NK, opacity: 0.4 }}>02</span>
            <h3 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 30, letterSpacing: '-0.4px', margin: 0, color: NK }}>Alterations & repairs</h3>
            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>{alterations.length} services</span>
          </div>
          <div ref={altGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {alterations.map((a, i) => <ServiceTile key={i} {...a}/>)}
          </div>
        </div>

        <div style={{ marginTop: 80, textAlign: 'center' }}>
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
    <section id="about" style={{ background: '#fff', padding: '120px 48px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 80, alignItems: 'center' }}>
        <div ref={imgRef} style={{
          borderRadius: 22, overflow: 'hidden', aspectRatio: '4/5',
          backgroundImage: 'url(https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}/>
        <div ref={textRef}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.32px', textTransform: 'uppercase', color: B, marginBottom: 18 }}>About the shop</div>
          <h2 style={{ fontFamily: BODY, fontWeight: 400, fontSize: 'clamp(36px,4vw,52px)', lineHeight: 1.1, letterSpacing: '-0.8px', margin: '0 0 28px', color: NK }}>
            Two generations of needle, thread, and patience.
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: '#3b3b40', margin: '0 0 20px' }}>
            For more than a decade, Straus Tailor Shop has dressed brides on their wedding day, fathers on their daughters', service members in dress uniform, and quiet locals who simply want their favorite jacket to fit again.
          </p>
          <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: '#3b3b40', margin: '0 0 32px' }}>
            We work on pretty much everything — and we love a unique custom project. Walk-ins are always welcome, no appointment needed. Typical turnaround is within two weeks, but we'll work with you if you need it sooner.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, paddingTop: 28, borderTop: `1px solid ${NK}1a` }}>
            <StatCounter target="10+" label="Years in business"/>
            <StatCounter target="Walk‑ins" label="No appointment needed"/>
            <StatCounter target="2 wks" label="Typical turnaround"/>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const [idx, setIdx]     = useState(0)
  const [prev, setPrev]   = useState(-1)
  const quoteRef          = useRef<HTMLDivElement>(null)
  const sectionRef        = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.from(sectionRef.current, {
      y: 20, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 92%', once: true },
    })
  }, [])

  const goTo = (i: number) => {
    if (i === idx) return
    setPrev(idx)
    gsap.to(quoteRef.current, { opacity: 0, y: -12, duration: 0.25, ease: 'power2.in', onComplete: () => {
      setIdx(i)
      gsap.fromTo(quoteRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    }})
  }

  const q = quotes[idx]

  return (
    <section id="reviews" ref={sectionRef} style={{ background: NK, color: '#fff', padding: '120px 48px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.32px', textTransform: 'uppercase', color: BS, marginBottom: 36 }}>What they say</div>
        <div style={{ fontSize: 96, lineHeight: 0.5, color: B, fontFamily: DANCE, marginBottom: 24, height: 40 }}>"</div>
        <div ref={quoteRef}>
          <p style={{ fontFamily: BODY, fontSize: 22, lineHeight: 1.55, fontWeight: 300, color: '#f0e6e8', margin: '0 0 36px' }}>{q.body}</p>
          <div style={{ fontFamily: DANCE, fontSize: 28, color: BS, marginBottom: 4 }}>{q.name}</div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#93939f' }}>{q.role}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 48 }}>
          {quotes.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === idx ? 28 : 8, height: 8, borderRadius: 9999,
              background: i === idx ? B : 'rgba(255,255,255,0.2)',
              border: 0, padding: 0, cursor: 'pointer',
              transition: 'all 300ms ease',
            }}/>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Showcase ──────────────────────────────────────────────────────────────────
function Showcase() {
  const imgRef     = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.from(sectionRef.current, {
      y: 30, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 92%', once: true },
    })
    gsap.from(overlayRef.current, {
      x: -30, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: overlayRef.current, start: 'top 92%', once: true },
    })
    // Subtle parallax inside the image
    gsap.to(imgRef.current, {
      yPercent: -10, ease: 'none',
      scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, [])

  return (
    <section ref={sectionRef} style={{ background: CR, padding: '120px 48px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ borderRadius: 22, overflow: 'hidden', aspectRatio: '21/9', position: 'relative' }}>
          <div ref={imgRef} style={{
            position: 'absolute', inset: '-15%',
            backgroundImage: 'url(https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=2000&q=80)',
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(12,12,14,0.6) 0%, rgba(12,12,14,0) 65%)' }}/>
          <div ref={overlayRef} style={{ position: 'absolute', left: 56, bottom: 56, color: '#fff', maxWidth: 460 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: BS, marginBottom: 14 }}>Featured craftsmanship</div>
            <h3 style={{ fontFamily: DANCE, fontSize: 56, lineHeight: 1.0, fontWeight: 600, margin: '0 0 14px' }}>Made by hand.</h3>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: '#E6CDD2', margin: 0, fontFamily: BODY }}>
              Hand-pinned, hand-finished, and pressed to set. From standard alterations to one-of-a-kind custom projects — if you're not sure, bring it in or give us a call.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const formRef    = useRef<HTMLFormElement>(null)
  const infoRef    = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setSent(true)
    setTimeout(() => { setSent(false); setForm({ name: '', email: '', message: '' }) }, 4000)
  }

  const inp: React.CSSProperties = {
    width: '100%', background: '#fafafa', border: '1px solid #e5e7eb',
    borderRadius: 8, padding: '14px 16px', fontSize: 14,
    fontFamily: BODY, color: NK, outline: 'none',
    transition: 'border-color 200ms ease',
  }

  return (
    <section id="contact" style={{ background: '#fff', padding: '120px 48px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
        <form ref={formRef} onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input placeholder="Your name" value={form.name} onChange={up('name')} style={inp} onFocus={e => (e.currentTarget.style.borderColor = B)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}/>
          <input type="email" placeholder="Email address" value={form.email} onChange={up('email')} style={inp} onFocus={e => (e.currentTarget.style.borderColor = B)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}/>
          <textarea placeholder="Tell us what you'd like tailored…" value={form.message} onChange={up('message')} rows={5} style={{ ...inp, resize: 'vertical' }} onFocus={e => (e.currentTarget.style.borderColor = B)} onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}/>
          <button type="submit" disabled={sent} style={{
            background: sent ? '#3b8a4f' : B, color: '#fff', border: 0, borderRadius: 32,
            padding: '14px 28px', fontSize: 15, fontWeight: 500, cursor: sent ? 'default' : 'pointer',
            fontFamily: BODY, alignSelf: 'flex-start', marginTop: 10,
            transition: 'background 200ms ease, transform 200ms ease',
          }}
          onMouseEnter={e => { if (!sent) { const el = e.currentTarget as HTMLButtonElement; el.style.background = BD; el.style.transform = 'translateY(-2px)' }}}
          onMouseLeave={e => { if (!sent) { const el = e.currentTarget as HTMLButtonElement; el.style.background = B; el.style.transform = 'translateY(0)' }}}>
            {sent ? "Message sent. We'll be in touch." : 'Send message'}
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
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, paddingBottom: 16, borderBottom: '1px solid #f2f2f2' }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.32px', textTransform: 'uppercase', color: '#75758a' }}>{row.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.4, color: NK, whiteSpace: 'pre-line' }}>{row.value}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
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
    <footer ref={ref} style={{ background: NK, color: '#fff', padding: '64px 48px 36px', fontFamily: BODY }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 56, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="footer-col">
            <div style={{ fontFamily: DANCE, fontSize: 38, fontWeight: 600, color: BS, lineHeight: 1, marginBottom: 4 }}>Straus</div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', marginBottom: 22 }}>Tailor Shop</div>
            <p style={{ fontSize: 13, color: '#93939f', margin: 0, maxWidth: 300, lineHeight: 1.6 }}>
              Master tailoring and alterations in Fargo for over 10 years. Walk-ins welcome — no appointment needed.
            </p>
          </div>
          <div className="footer-col">
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.28px', textTransform: 'uppercase', marginBottom: 16 }}>Services</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Bridal','Suits','Uniforms','Repairs'].map(x => (
                <li key={x}><a href="#services" style={{ color: '#93939f', textDecoration: 'none', fontSize: 14, transition: 'color 200ms ease' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = BS}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#93939f'}>{x}</a></li>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 28, fontSize: 12, color: '#93939f' }}>
          <span>© 2026 Straus Tailor Shop. All rights reserved.</span>
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
      <Nav/>
      <Hero/>
      <Services/>
      <About/>
      <Testimonials/>
      <Showcase/>
      <Contact/>
      <Footer/>
    </div>
  )
}
