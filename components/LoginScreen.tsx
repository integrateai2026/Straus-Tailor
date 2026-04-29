'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

interface Props {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(headerRef.current, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
    tl.fromTo(
      formRef.current!.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.09 },
      '-=0.3'
    )
    tl.fromTo(btnRef.current, { y: 16, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.4 }, '-=0.2')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.15 })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        onLogin()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Incorrect username or password.')
        gsap.to(btnRef.current, { scale: 1, duration: 0.2 })
        gsap.to(containerRef.current, { x: -7, duration: 0.06, yoyo: true, repeat: 5, ease: 'power2.inOut' })
      }
    } catch {
      setError('Network error. Please try again.')
      gsap.to(btnRef.current, { scale: 1, duration: 0.2 })
    } finally {
      setLoading(false)
    }
  }

  const fieldClass = 'flex items-center gap-3 px-5 h-[62px] bg-[#1a1a1a] border border-[#252525] rounded-2xl focus-within:border-[#6B1A2E]/60 transition-colors group'
  const inputClass = 'w-full bg-transparent text-white text-sm placeholder-[#444] outline-none leading-none'

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
    >
      {/* Header */}
      <div ref={headerRef} className="flex flex-col items-center mb-10" style={{ opacity: 0 }}>
        <h1 className="text-5xl text-white leading-none" style={{ fontFamily: 'var(--font-dancing)' }}>
          Straus Tailor Shop
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="rounded-2xl p-4 mb-3 bg-[#111] border border-[#1e1e1e]">
        <div ref={formRef} className="space-y-3">
          {/* Username */}
          <label className={fieldClass} style={{ opacity: 0 }}>
            <span className="text-white/30 group-focus-within:text-rose-300/70 transition-colors shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 group-focus-within:text-rose-300/70 transition-colors leading-none mb-1">
                Username
              </p>
              <input
                className={inputClass}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </label>

          {/* Password */}
          <label className={fieldClass} style={{ opacity: 0 }}>
            <span className="text-white/30 group-focus-within:text-rose-300/70 transition-colors shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 group-focus-within:text-rose-300/70 transition-colors leading-none mb-1">
                Password
              </p>
              <input
                className={inputClass}
                placeholder="Enter password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="text-white/20 hover:text-rose-300/70 transition-colors shrink-0"
              tabIndex={-1}
            >
              {showPw ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </label>
        </div>
        </div> {/* end glass-panel */}

        {error && (
          <p className="text-red-400 text-xs text-center px-2 mb-2">{error}</p>
        )}

        <button
          ref={btnRef}
          type="submit"
          disabled={loading}
          className="w-full h-[56px] text-white text-sm font-semibold tracking-[0.1em] uppercase rounded-2xl mt-4 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ opacity: 0, background: 'linear-gradient(135deg, #6B1A2E 0%, #4A1020 100%)', boxShadow: '0 4px 24px rgba(90,15,30,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #7d1f35 0%, #5a1428 100%)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #6B1A2E 0%, #4A1020 100%)')}
        >
          {loading ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          )}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

    </div>
  )
}
