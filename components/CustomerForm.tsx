'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'
import PrintTicket from './PrintTicket'
import './StarBorder.css'

/* ── Star border field wrapper ────────────────────────────── */
const STAR_COLOR = 'rgba(255,255,255,0.9)'
const STAR_SPEED = '3.5s'

function FieldWrap({
  fieldId,
  focused,
  onFocus,
  onBlur,
  children,
}: {
  fieldId: string
  focused: string
  onFocus: (id: string) => void
  onBlur: () => void
  children: React.ReactNode
}) {
  const active = focused === fieldId
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{ padding: active ? '1.5px' : '1.5px', background: active ? 'transparent' : 'transparent' }}
      onFocus={() => onFocus(fieldId)}
      onBlur={onBlur}
    >
      {/* Always-present container — active state shows the star, inactive is transparent */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
        style={{ opacity: active ? 1 : 0, transition: 'opacity 0.25s ease' }}
      >
        <div className="star-border-bottom" style={{ background: `radial-gradient(circle, ${STAR_COLOR}, transparent 12%)`, animationDuration: STAR_SPEED }} />
        <div className="star-border-top"    style={{ background: `radial-gradient(circle, ${STAR_COLOR}, transparent 12%)`, animationDuration: STAR_SPEED }} />
      </div>
      {/* Field sits on top with 1.5px inset so the border ring is visible */}
      <div className="relative rounded-[10px] overflow-hidden" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

/* ── Date helpers ─────────────────────────────────────────── */
function localDate(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function twoWeeksOut(): string {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  const day = d.getDay()
  if (day === 6) d.setDate(d.getDate() - 1) // Sat → Fri
  if (day === 0) d.setDate(d.getDate() - 2) // Sun → Fri
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

/* ── Shared styles ────────────────────────────────────────── */
const FIELD = 'flex items-center gap-4 px-4 bg-[#1a1a1a] border border-white/[0.06] rounded-xl focus-within:border-white/[0.12] transition-colors group'
const LABEL = 'text-[11px] uppercase tracking-[0.2em] font-medium text-[#A1A1AA] group-focus-within:text-[#D1D5DB] transition-colors leading-none mb-[5px]'
const INPUT = 'w-full bg-transparent text-[#F9FAFB] text-[16px] placeholder-[#3D3D3D] outline-none leading-none'

/* ── Icons ────────────────────────────────────────────────── */
const I = {
  user: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/></svg>,
  cal: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  dollar: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  tag: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  notes: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
}

/* ── DateField ────────────────────────────────────────────── */
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  function open() {
    try { inputRef.current?.showPicker() } catch { inputRef.current?.click() }
  }
  return (
    <div onClick={open} className={`${FIELD} h-[64px] cursor-pointer`}>
      <span className="text-[#6B7280] shrink-0">{I.cal}</span>
      <div className="flex-1 min-w-0">
        <p className={LABEL}>{label}</p>
        <p className={`text-[16px] leading-none ${value ? 'text-[#F9FAFB]' : 'text-[#374151]'}`}>
          {value ? formatDate(value) : 'Select date'}
        </p>
      </div>
      <input ref={inputRef} type="date" value={value} onChange={e => onChange(e.target.value)} className="sr-only" tabIndex={-1} />
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────── */
export default function CustomerForm() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    dropoffDate: localDate(),
    dueDate: twoWeeksOut(),
    notes: '',
    totalAmount: '',
    itemCount: 1,
    paid: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [focused, setFocused] = useState('name')
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleFocus(id: string) {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setFocused(id)
  }
  function handleBlur() {
    blurTimer.current = setTimeout(() => setFocused(''), 80)
  }

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef    = useRef<HTMLDivElement>(null)
  const fieldsRef    = useRef<HTMLDivElement>(null)
  const btnRef       = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 })
    tl.fromTo(fieldsRef.current!.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.06 }, '-=0.25')
    tl.fromTo(btnRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, '-=0.15')
  }, [])

  function resetForm() {
    gsap.to(fieldsRef.current!.children, {
      y: -8, opacity: 0, duration: 0.25, stagger: 0.04, ease: 'power2.in',
      onComplete: () => {
        setForm({ customerName: '', phone: '', dropoffDate: localDate(), dueDate: twoWeeksOut(), notes: '', totalAmount: '', itemCount: 1, paid: false })
        setError('')
        gsap.fromTo(fieldsRef.current!.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' })
        gsap.fromTo(btnRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName.trim() || !form.phone.trim() || !form.dropoffDate || !form.dueDate) {
      setError('Please fill in all required fields.')
      gsap.to(containerRef.current, { x: -5, duration: 0.06, yoyo: true, repeat: 5, ease: 'power2.inOut' })
      return
    }
    setLoading(true)
    setError('')
    gsap.to(btnRef.current, { scale: 0.97, duration: 0.12 })
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          totalAmount: form.totalAmount !== '' ? parseFloat(form.totalAmount) : undefined,
          itemCount: form.itemCount > 0 ? form.itemCount : undefined,
        }),
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

  return (
    <>
      <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center px-5 py-10">

        {/* Header */}
        <div ref={headerRef} className="mb-8" style={{ opacity: 0 }}>
          <h1 className="text-5xl text-white text-center leading-none" style={{ fontFamily: 'var(--font-dancing)' }}>
            Straus Tailor Shop
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4 mb-3">
            <div ref={fieldsRef} className="space-y-2.5">

              {/* Full Name */}
              <FieldWrap fieldId="name" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                <label className={`${FIELD} h-[64px] cursor-text`}>
                  <span className="text-[#6B7280] shrink-0">{I.user}</span>
                  <div className="flex-1 min-w-0">
                    <p className={LABEL}>Full Name</p>
                    <input className={INPUT} placeholder="Customer name" value={form.customerName}
                      onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                      autoComplete="off" autoFocus />
                  </div>
                </label>
              </FieldWrap>

              {/* Phone */}
              <FieldWrap fieldId="phone" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                <label className={`${FIELD} h-[64px] cursor-text`}>
                  <span className="text-[#6B7280] shrink-0">{I.phone}</span>
                  <div className="flex-1 min-w-0">
                    <p className={LABEL}>Phone Number</p>
                    <input className={INPUT} placeholder="(555) 000-0000" type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      autoComplete="off" />
                  </div>
                </label>
              </FieldWrap>

              {/* Dates — side by side */}
              <div className="grid grid-cols-2 gap-2.5">
                <FieldWrap fieldId="dropoff" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                  <DateField label="Drop-off Date" value={form.dropoffDate} onChange={v => setForm(f => ({ ...f, dropoffDate: v }))} />
                </FieldWrap>
                <FieldWrap fieldId="due" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                  <DateField label="Due Date" value={form.dueDate} onChange={v => setForm(f => ({ ...f, dueDate: v }))} />
                </FieldWrap>
              </div>

              {/* Total Amount */}
              <FieldWrap fieldId="amount" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                <label className={`${FIELD} h-[64px] cursor-text`}>
                  <span className="text-[#6B7280] shrink-0">{I.dollar}</span>
                  <div className="flex-1 min-w-0">
                    <p className={LABEL}>Total Amount</p>
                    <input className={INPUT} placeholder="0.00" inputMode="decimal" value={form.totalAmount}
                      onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value.replace(/[^0-9.]/g, '') }))}
                      autoComplete="off" />
                  </div>
                </label>
              </FieldWrap>

              {/* Paid / Unpaid button group */}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, paid: false }))}
                  className={`h-12 rounded-xl text-sm font-semibold transition-all ${
                    !form.paid
                      ? 'bg-white/[0.08] text-[#D1D5DB] border border-white/[0.15]'
                      : 'bg-transparent text-[#555] border border-white/[0.06] hover:border-white/[0.1] hover:text-[#888]'
                  }`}>
                  Unpaid
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, paid: true }))}
                  className={`h-12 rounded-xl text-sm font-semibold transition-all ${
                    form.paid
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-transparent text-[#555] border border-white/[0.06] hover:border-white/[0.1] hover:text-[#888]'
                  }`}>
                  Paid
                </button>
              </div>

              {/* Items stepper */}
              <FieldWrap fieldId="items" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                <div className={`${FIELD} h-[64px]`}>
                  <span className="text-[#6B7280] shrink-0">{I.tag}</span>
                  <div className="flex-1 min-w-0">
                    <p className={LABEL}>Number of Items</p>
                    <span className="text-[16px] text-white leading-none">{form.itemCount}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => setForm(f => ({ ...f, itemCount: Math.max(1, f.itemCount - 1) }))}
                      className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-[#9CA3AF] hover:text-white text-lg font-medium flex items-center justify-center transition-colors leading-none border border-[#2a2a2a]">
                      −
                    </button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, itemCount: f.itemCount + 1 }))}
                      className="w-8 h-8 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-[#9CA3AF] hover:text-white text-lg font-medium flex items-center justify-center transition-colors leading-none border border-[#2a2a2a]">
                      +
                    </button>
                  </div>
                </div>
              </FieldWrap>

              {/* Notes */}
              <FieldWrap fieldId="notes" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                <label className={`${FIELD} items-start py-4 cursor-text h-auto min-h-[90px]`}>
                  <span className="text-[#6B7280] shrink-0 mt-0.5">{I.notes}</span>
                  <div className="flex-1">
                    <p className={LABEL}>Notes (optional)</p>
                    <textarea className="w-full bg-transparent text-[#F9FAFB] text-[15px] placeholder-[#374151] outline-none leading-relaxed resize-none"
                      placeholder="Hem pants, take in waist 1 inch…" rows={3}
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                </label>
              </FieldWrap>

            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-2">{error}</p>}

          <button ref={btnRef} type="submit" disabled={loading}
            className="w-full h-[56px] rounded-xl text-white text-[15px] font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ opacity: 0, background: '#065F46' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#047857')}
            onMouseLeave={e => (e.currentTarget.style.background = '#065F46')}>
            {loading
              ? <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            }
            {loading ? 'Saving…' : 'Print Ticket'}
          </button>
        </form>
      </div>

      {order && <PrintTicket order={order} onPrint={() => window.print()} onClose={() => { setOrder(null); resetForm() }} />}
    </>
  )
}
