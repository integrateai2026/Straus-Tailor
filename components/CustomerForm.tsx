'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'
import PrintTicket from './PrintTicket'

const today = () => new Date().toISOString().split('T')[0]

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function Field({ icon, label, children }: FieldProps) {
  return (
    <label className="flex items-center gap-3 bg-[#1a1a1a] border border-[#252525] rounded-2xl px-5 h-[62px] focus-within:border-rose-700/40 transition-colors group cursor-text">
      <span className="text-[#666] group-focus-within:text-rose-400/80 transition-colors shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#777] group-focus-within:text-rose-400/80 transition-colors leading-none mb-1">
          {label}
        </p>
        {children}
      </div>
    </label>
  )
}

interface DateFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function DateField({ label, value, onChange }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function open() {
    try {
      inputRef.current?.showPicker()
    } catch {
      inputRef.current?.click()
    }
  }

  return (
    <div
      onClick={open}
      className="flex items-center gap-3 bg-[#1a1a1a] border border-[#252525] rounded-2xl px-5 h-[62px] focus-within:border-rose-700/40 transition-colors group cursor-pointer"
    >
      <span className="text-[#666] group-focus-within:text-rose-400/80 transition-colors shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#777] group-focus-within:text-rose-400/80 transition-colors leading-none mb-1">
          {label}
        </p>
        <p className={`text-sm leading-none ${value ? 'text-white' : 'text-[#3a3a3a]'}`}>
          {value ? formatDate(value) : 'Select date'}
        </p>
      </div>
      <span className="text-[#444] group-focus-within:text-rose-400/50 transition-colors shrink-0">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  )
}

const ICONS = {
  dollar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  tag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
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
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
}

const INPUT_CLASS = 'w-full bg-transparent text-white text-sm placeholder-[#555] outline-none leading-none'

export default function CustomerForm() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    dropoffDate: today(),
    dueDate: '',
    notes: '',
    totalAmount: '',
    itemCount: '',
    paid: false,
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
        setForm({ customerName: '', phone: '', dropoffDate: today(), dueDate: '', notes: '', totalAmount: '', itemCount: '', paid: false })
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
        body: JSON.stringify({
          ...form,
          totalAmount: form.totalAmount !== '' ? parseFloat(form.totalAmount) : undefined,
          itemCount:   form.itemCount   !== '' ? parseInt(form.itemCount, 10)  : undefined,
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

  function handleClose() {
    setOrder(null)
    resetForm()
  }

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-10"
      >
        {/* Header */}
        <div ref={headerRef} className="flex flex-col items-center mb-10" style={{ opacity: 0 }}>
          <h1 className="text-5xl text-white leading-none" style={{ fontFamily: 'var(--font-dancing)' }}>
            Straus Tailor Shop
          </h1>
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

            <DateField
              label="Drop-off Date"
              value={form.dropoffDate}
              onChange={(v) => setForm((f) => ({ ...f, dropoffDate: v }))}
            />

            <DateField
              label="Due Date"
              value={form.dueDate}
              onChange={(v) => setForm((f) => ({ ...f, dueDate: v }))}
            />

            {/* Total Amount + Paid toggle */}
            <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#252525] rounded-2xl px-5 h-[62px] focus-within:border-rose-700/40 transition-colors group">
              <span className="text-[#666] group-focus-within:text-rose-400/80 transition-colors shrink-0">
                {ICONS.dollar}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#777] group-focus-within:text-rose-400/80 transition-colors leading-none mb-1">
                  Total Amount
                </p>
                <input
                  className={INPUT_CLASS}
                  placeholder="0.00"
                  inputMode="decimal"
                  value={form.totalAmount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.]/g, '')
                    setForm((f) => ({ ...f, totalAmount: v }))
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="w-px h-7 bg-[#2a2a2a] shrink-0 mx-1" />
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, paid: !f.paid }))}
                className="flex items-center gap-2 shrink-0 focus:outline-none"
              >
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${form.paid ? 'bg-emerald-500' : 'bg-[#2a2a2a]'}`}>
                  <span className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${form.paid ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                </div>
                <span className={`text-xs font-medium transition-colors w-10 ${form.paid ? 'text-emerald-400' : 'text-[#555]'}`}>
                  {form.paid ? 'Paid' : 'Unpaid'}
                </span>
              </button>
            </div>

            {/* Number of items */}
            <Field icon={ICONS.tag} label="Number of Items">
              <input
                className={INPUT_CLASS}
                placeholder="e.g. 3"
                inputMode="numeric"
                value={form.itemCount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, '')
                  setForm((f) => ({ ...f, itemCount: v }))
                }}
                autoComplete="off"
              />
            </Field>

            <label className="flex items-start gap-3 bg-[#1a1a1a] border border-[#252525] rounded-2xl px-5 py-4 focus-within:border-rose-700/40 transition-colors group cursor-text min-h-[100px]">
              <span className="text-[#666] group-focus-within:text-rose-400/80 transition-colors shrink-0 mt-0.5">
                {ICONS.notes}
              </span>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#555] group-focus-within:text-rose-400/70 transition-colors leading-none mb-2">
                  Notes (optional)
                </p>
                <textarea
                  className="w-full bg-transparent text-white text-sm placeholder-[#555] outline-none leading-relaxed resize-none"
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
            className="w-full h-[58px] bg-gradient-to-r from-rose-800 to-red-800 hover:from-rose-700 hover:to-red-700 text-white text-sm font-semibold tracking-[0.08em] uppercase rounded-2xl mt-2 flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(159,18,57,0.4)]"
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

      </div>

      {order && (
        <PrintTicket order={order} onPrint={() => window.print()} onClose={handleClose} />
      )}
    </>
  )
}
