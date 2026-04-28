'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'
import PrintTicket from './PrintTicket'

interface FieldProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function Field({ icon, label, children }: FieldProps) {
  return (
    <label className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 h-[62px] focus-within:border-[#444] transition-colors group cursor-text">
      <span className="text-[#555] group-focus-within:text-[#888] transition-colors shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#555] group-focus-within:text-[#888] transition-colors leading-none mb-1">
          {label}
        </p>
        {children}
      </div>
    </label>
  )
}

const ICONS = {
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
}

const INPUT_CLASS =
  'w-full bg-transparent text-white text-sm placeholder-[#3a3a3a] outline-none leading-none'

export default function CustomerForm() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    dropoffDate: '',
    dueDate: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(headerRef.current, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
    tl.fromTo(
      fieldsRef.current!.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 },
      '-=0.3'
    )
    tl.fromTo(btnRef.current, { y: 16, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.45 }, '-=0.2')
    tl.fromTo(footerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.2')
  }, [])

  function resetForm() {
    const tl = gsap.timeline({
      onComplete: () => {
        setForm({ customerName: '', phone: '', dropoffDate: '', dueDate: '', notes: '' })
        setError('')
        gsap.fromTo(
          fieldsRef.current!.children,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
        )
        gsap.fromTo(btnRef.current, { scale: 0.97, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' })
      },
    })
    tl.to(fieldsRef.current!.children, { y: -10, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'power2.in' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.phone.trim() || !form.dropoffDate || !form.dueDate) {
      setError('Please fill in all required fields.')
      gsap.to(containerRef.current, { x: -6, duration: 0.06, yoyo: true, repeat: 5, ease: 'power2.inOut' })
      return
    }

    setLoading(true)
    setError('')

    gsap.to(btnRef.current, { scale: 0.97, duration: 0.15 })

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      const created: Order = await res.json()
      gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'back.out(2)' })
      setOrder(created)
    } catch {
      setError('Something went wrong. Please try again.')
      gsap.to(btnRef.current, { scale: 1, duration: 0.2 })
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleClose() {
    setOrder(null)
    resetForm()
  }

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-10">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center mb-10" style={{ opacity: 0 }}>
          <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-[0.06em] text-white uppercase">Straus</h1>
          <p className="text-[11px] tracking-[0.28em] text-[#555] uppercase mt-0.5">Tailor Shop</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
          <div ref={fieldsRef} className="space-y-3">
            <Field icon={ICONS.user} label="Full Name">
              <input
                className={INPUT_CLASS}
                placeholder="Customer name"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                autoComplete="off"
              />
            </Field>

            <Field icon={ICONS.phone} label="Phone Number">
              <input
                className={INPUT_CLASS}
                placeholder="(555) 000-0000"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                autoComplete="off"
              />
            </Field>

            <Field icon={ICONS.calendar} label="Drop-off Date">
              <input
                className={`${INPUT_CLASS} [color-scheme:dark]`}
                type="date"
                value={form.dropoffDate}
                onChange={(e) => setForm((f) => ({ ...f, dropoffDate: e.target.value }))}
              />
            </Field>

            <Field icon={ICONS.calendar} label="Due Date">
              <input
                className={`${INPUT_CLASS} [color-scheme:dark]`}
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </Field>

            {/* Notes */}
            <label className="flex items-start gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-5 py-4 focus-within:border-[#444] transition-colors group cursor-text min-h-[100px]">
              <span className="text-[#555] group-focus-within:text-[#888] transition-colors shrink-0 mt-0.5">
                {ICONS.notes}
              </span>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#555] group-focus-within:text-[#888] transition-colors leading-none mb-2">
                  Notes (optional)
                </p>
                <textarea
                  className="w-full bg-transparent text-white text-sm placeholder-[#3a3a3a] outline-none leading-relaxed resize-none"
                  placeholder="Hem pants, take in waist 1 inch…"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </label>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center px-2">{error}</p>
          )}

          <button
            ref={btnRef}
            type="submit"
            disabled={loading}
            className="w-full h-[58px] bg-white text-black text-sm font-semibold tracking-[0.08em] uppercase rounded-2xl mt-2 flex items-center justify-center gap-2.5 hover:bg-gray-100 active:scale-[0.98] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ opacity: 0 }}
          >
            {loading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            )}
            {loading ? 'Saving…' : 'Submit / Print Ticket'}
          </button>
        </form>

        {/* Footer */}
        <div ref={footerRef} className="flex items-center gap-2 mt-10 opacity-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
          <p className="text-[11px] text-[#333] tracking-widest uppercase">Straus Tailor Shop</p>
        </div>
      </div>

      {order && (
        <PrintTicket order={order} onPrint={handlePrint} onClose={handleClose} />
      )}
    </>
  )
}
