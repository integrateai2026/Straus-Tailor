'use client'

import { useEffect, useRef, useState } from 'react' // useRef still used by containerRef, headerRef, etc.
import gsap from 'gsap'
import { Order } from '@/lib/types'
import PrintTicket from './PrintTicket'
import './StarBorder.css'

/* ── Field wrapper — clean brass focus ring, no animation ─── */
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
      className="rounded-xl transition-shadow"
      style={{
        outline: active ? '2px solid rgba(139,115,85,0.50)' : 'none',
      outlineOffset: 1,
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 2px rgba(0,0,0,0.04)',
        transition: 'box-shadow 200ms ease',
      }}
      onFocus={() => onFocus(fieldId)}
      onBlur={onBlur}
    >
      {children}
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
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

/* ── Shared styles ────────────────────────────────────────── */
// ── Design tokens: warm paper card on deep charcoal ──────────
const PAGE_BG     = '#17171b'
const CARD_BG     = '#F6F1E9'       // warm ivory paper
const INPUT_BG    = '#FDFAF5'       // warm white inputs
const TEXT_DARK   = '#1C1A18'       // near-black charcoal
const BRASS       = '#8B7355'       // muted brass accent
const LABEL_COLOR = '#4A443C'       // dark warm charcoal — high contrast on ivory
const TAUPE       = '#6B6358'       // warm taupe for $ sign and icons
const PLACEHOLDER = '#8A847C'       // medium gray — clearly readable

// Tailwind classes — all colors must be literal hex strings (no JS vars),
// otherwise Tailwind's build-time scanner can't generate the CSS.
const FIELD = 'flex items-center gap-3 px-4 bg-[#FDFAF5] border border-black/[0.12] rounded-xl transition-colors'
const FIELD_FOCUS = 'border-[#8B7355]/50'   // added via focus-within in JSX wrapper

// Label above each box — class handles responsive size, style handles color
const FL_CLASS = 'block text-[13px] md:text-[18px] font-bold tracking-[0.14em] uppercase mb-[5px]'
const FL_STYLE: React.CSSProperties = { color: '#4A443C' }
// Keep FL as alias for inline-only use (e.g. dynamic labels)
const FL = FL_STYLE

// Input — text color via inline style (safer than Tailwind interpolation)
const INPUT = 'w-full bg-transparent text-[18px] md:text-[21px] placeholder-[#8A847C] outline-none leading-none'
const INPUT_STYLE: React.CSSProperties = { color: '#1C1A18', caretColor: '#1C1A18' }

/* ── Icons ────────────────────────────────────────────────── */
const ICON_CLR = '#7A7268'   // warm medium gray — readable on ivory
const I = {
  user:   <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  phone:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/></svg>,
  cal:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  dollar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  tag:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  notes:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
}

/* ── Phone auto-formatter ────────────────────────────────── */
function autoFormatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/* ── DateField — label ABOVE box ──────────────────────────── */
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className={FL_CLASS} style={FL_STYLE}>{label}</span>
      <div className={`${FIELD} ${FIELD_H} cursor-pointer relative`}>
        <span className="shrink-0 pointer-events-none">{I.cal}</span>
        <span className="flex-1 pointer-events-none text-[18px] md:text-[21px]"
          style={{ color: value ? '#1C1A18' : '#8A847C' }}>
          {value ? formatDate(value) : 'Select date'}
        </span>
        <svg className="pointer-events-none shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ICON_CLR} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
      </div>
    </div>
  )
}

// Field height — slightly reduced now that labels are outside
const FIELD_H = 'h-[54px] md:h-[64px]'

/* ── Garments & Alterations options ──────────────────────── */
const GARMENTS = [
  'Dress / Gown', 'Wedding Dress', 'Suit', 'Jacket / Coat',
  'Shirt / Blouse', 'Pants', 'Jeans', 'Skirt',
  'Uniform', 'Sweater / Hoodie', 'Curtains', 'Other',
]
const ALTERATIONS = [
  'Hem', 'Sleeve Adjustment', 'Strap Adjustment', 'Waist Adjustment',
  'Take In', 'Let Out', 'Taper', 'Zipper',
  'Buttons', 'Patch / Hole Repair', 'Seam Repair', 'Lining',
  'Elastic', 'Bustle', 'Custom / Other',
]

/* ── Main Component ───────────────────────────────────────── */
export default function CustomerForm() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    dropoffDate: localDate(),
    dueDate: twoWeeksOut(),
    notes: '',
    totalAmount: '',
    paid: false,
    smsTransactional: false,
    smsMarketing: false,
    termsAccepted: false,
    autoFilledName: '', // UI-only: which name (if any) came from the returning-customer lookup
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [focused, setFocused] = useState('phone')
  const lastLookupRef = useRef('')   // last 10-digit number looked up — avoid duplicate requests
  const nameTouchedRef = useRef(false) // true once the user focuses/types in the name field
  const [suggestedName, setSuggestedName] = useState('') // offered instead of auto-filling once touched
  const [staffOpen, setStaffOpen] = useState(false)
  const [garments, setGarments] = useState<Record<string, number>>({})
  const [alterations, setAlterations] = useState<string[]>([])
  const [garmentsOpen, setGarmentsOpen] = useState(false)
  const [alterationsOpen, setAlterationsOpen] = useState(false)
  const staffPanelRef = useRef<HTMLDivElement>(null)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleFocus(id: string) {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setFocused(id)
  }
  function handleBlur() {
    blurTimer.current = setTimeout(() => setFocused(''), 80)
  }

  // Returning-customer auto-fill: when a complete number matches a past order,
  // the most recent name on record fills in (still fully editable).
  function handlePhoneChange(value: string) {
    const formatted = autoFormatPhone(value)
    const digits = formatted.replace(/\D/g, '')
    setForm(f => {
      const next = { ...f, phone: formatted }
      // Number no longer complete — retire the auto-filled name (hand-typed names stay)
      if (digits.length < 10 && f.autoFilledName && f.customerName === f.autoFilledName) {
        next.customerName = ''
        next.autoFilledName = ''
      }
      return next
    })
    if (digits.length === 10) {
      if (digits !== lastLookupRef.current) {
        lastLookupRef.current = digits
        lookupCustomer(digits)
      }
    } else {
      lastLookupRef.current = '' // re-lookup if the same number is completed again
      setSuggestedName('')
    }
  }

  async function lookupCustomer(digits: string) {
    try {
      const res = await fetch(`/api/customers/lookup?phone=${digits}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.found && data.customerName) {
        setForm(f => {
          // Ignore a stale response for a number that's no longer on screen
          if (f.phone.replace(/\D/g, '') !== digits) return f
          // Never type into a field the user is already working in — offer it instead.
          // This is what keeps a late response from landing mid-keystroke.
          if (nameTouchedRef.current || f.customerName.trim()) {
            if (f.customerName.trim() !== data.customerName) setSuggestedName(data.customerName)
            return f
          }
          return { ...f, customerName: data.customerName, autoFilledName: data.customerName }
        })
      } else {
        // Unknown number: clear a lingering auto-fill (hand-typed names always stay)
        setSuggestedName('')
        setForm(f =>
          f.phone.replace(/\D/g, '') !== digits ||
          !f.autoFilledName || f.customerName !== f.autoFilledName
            ? f
            : { ...f, customerName: '', autoFilledName: '' }
        )
      }
    } catch { /* lookup is best-effort — the form works fine without it */ }
  }

  function useSuggestedName() {
    setForm(f => ({ ...f, customerName: suggestedName, autoFilledName: suggestedName }))
    setSuggestedName('')
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
        setForm({ customerName: '', phone: '', dropoffDate: localDate(), dueDate: twoWeeksOut(), notes: '', totalAmount: '', paid: false, smsTransactional: false, smsMarketing: false, termsAccepted: false, autoFilledName: '' })
        setError('')
        setStaffOpen(false)
        setGarments({})
        setAlterations([])
        setSuggestedName('')
        lastLookupRef.current = ''
        nameTouchedRef.current = false
        gsap.fromTo(fieldsRef.current!.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out' })
        gsap.fromTo(btnRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const shake = () => gsap.to(containerRef.current, { x: -5, duration: 0.06, yoyo: true, repeat: 5, ease: 'power2.inOut' })
    if (!form.customerName.trim() || !form.phone.trim() || !form.dueDate) {
      setError('Please fill in all required fields.')
      shake()
      return
    }
    // Guard against a partially deleted number reaching the ticket
    if (form.phone.replace(/\D/g, '').length !== 10) {
      setError('Phone number is incomplete — please enter all 10 digits.')
      setFocused('phone')
      shake()
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
          autoFilledName: undefined, // UI-only field — not part of the order
          totalAmount:  form.totalAmount !== '' ? parseFloat(form.totalAmount) : undefined,
          itemCount:    Object.values(garments).reduce((a, b) => a + b, 0) || undefined,
          garments:     Object.keys(garments).length > 0 ? garments : undefined,
          alterations:  alterations.length > 0 ? alterations : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const created: Order = {
        ...await res.json(),
        garments:         Object.keys(garments).length > 0 ? garments : undefined,
        alterations:      alterations.length > 0 ? alterations : undefined,
        smsConsent:       form.smsTransactional || form.smsMarketing,
        smsTransactional: form.smsTransactional,
        smsMarketing:     form.smsMarketing,
      }
      gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'back.out(2)' })

      // Auto-print one ticket immediately — fire and forget
      fetch('/api/printer/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: created }),
      }).catch(() => {})

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
      {/*
        min-height:100dvh — container is at least the full screen.
        `my-auto` on the inner wrapper centers content vertically when
        the screen is taller than the form. When the form is taller than
        the screen (e.g. keyboard open), the PAGE scrolls naturally —
        no internal card scroll, no clipping.
      */}
      <div
        ref={containerRef}
        className="flex flex-col items-center px-4 py-4 md:px-8 md:py-6"
        style={{ minHeight: '100dvh', background: PAGE_BG }}
      >
        <div className="mb-auto w-full max-w-xl md:max-w-2xl" style={{ marginTop: '12vh' }}>

          {/* Header — warm cream on dark charcoal */}
          <div ref={headerRef} className="mb-4 md:mb-6" style={{ opacity: 0 }}>
            <h1 className="text-4xl md:text-5xl text-center leading-none" style={{
              fontFamily: 'var(--font-dancing)',
              color: '#E8E0D0',
              letterSpacing: '0.5px',
            }}>
              Straus Tailor Shop
            </h1>
          </div>

          {/* Form card — warm ivory paper floating on charcoal */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="rounded-2xl mb-4 px-4 pt-5 md:px-7 md:pt-7" style={{
              background: CARD_BG,
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.45), 0 40px 80px rgba(0,0,0,0.35)',
              paddingBottom: staffOpen ? '20px' : '10px',
              transition: 'padding-bottom 300ms ease',
            }}>
              {/*
                Visual grouping rules:
                — Label → its field: 8px (FL.marginBottom) — stays tight so they read as one unit
                — Field group → next field group: 20px (space-y-5) — clearly separates groups
                — Customer section → Staff section: extra top padding on staff block
              */}
              <div ref={fieldsRef} className="space-y-5">

                {/* ── Customer information — phone first so returning customers auto-fill ── */}
                <div>
                  <span className={FL_CLASS} style={FL_STYLE}>Phone Number *</span>
                  <FieldWrap fieldId="phone" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                    <label className={`${FIELD} ${FIELD_H} cursor-text`}>
                      <span className="shrink-0">{I.phone}</span>
                      <input className={INPUT} style={INPUT_STYLE} placeholder="(555) 000-0000" type="tel" value={form.phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        autoComplete="off" autoFocus />
                    </label>
                  </FieldWrap>
                </div>

                <div>
                  <span className={FL_CLASS} style={FL_STYLE}>Full Name *</span>
                  <FieldWrap fieldId="name" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                    <label className={`${FIELD} ${FIELD_H} cursor-text`}>
                      <span className="shrink-0">{I.user}</span>
                      <input className={INPUT} style={INPUT_STYLE} placeholder="Customer name" value={form.customerName}
                        onFocus={() => { nameTouchedRef.current = true }}
                        onChange={e => {
                          nameTouchedRef.current = true
                          setForm(f => ({ ...f, customerName: e.target.value }))
                        }}
                        autoComplete="off" />
                    </label>
                  </FieldWrap>
                  {form.autoFilledName && form.customerName === form.autoFilledName && (
                    <p style={{ fontSize: 12, marginTop: 6, fontWeight: 600, color: '#8B7355' }}>
                      ↩ Returning customer — name filled automatically
                    </p>
                  )}
                  {suggestedName && form.customerName !== suggestedName && (
                    <div className="flex items-center gap-2 mt-2">
                      <button type="button" onClick={useSuggestedName}
                        className="flex-1 flex items-center gap-3 h-[52px] px-4 rounded-xl transition-colors text-left"
                        style={{ background: 'rgba(139,115,85,0.09)', border: '1.5px solid rgba(139,115,85,0.35)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,115,85,0.16)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,115,85,0.09)'}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span className="flex-1 min-w-0">
                          <span className="block truncate" style={{ fontSize: 16, fontWeight: 700, color: '#1C1A18', lineHeight: 1.2 }}>
                            {suggestedName}
                          </span>
                          <span className="block" style={{ fontSize: 11, color: '#8B7355', marginTop: 1 }}>
                            Returning customer — tap to use
                          </span>
                        </span>
                        <span className="shrink-0 px-3 py-1.5 rounded-lg" style={{ background: '#8B7355', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                          Use
                        </span>
                      </button>
                      <button type="button" onClick={() => setSuggestedName('')}
                        aria-label="Dismiss suggestion"
                        className="w-11 h-[52px] shrink-0 flex items-center justify-center rounded-xl transition-colors"
                        style={{ color: '#A89F94' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#6B6358'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#A89F94'}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* ── SMS Consent — appears once a valid phone number is entered ── */}
                <div style={{
                  overflow: 'hidden',
                  maxHeight: form.phone.replace(/\D/g, '').length === 10 ? '200px' : '0px',
                  opacity: form.phone.replace(/\D/g, '').length === 10 ? 1 : 0,
                  marginTop: form.phone.replace(/\D/g, '').length === 10 ? undefined : 0,
                  transition: 'max-height 350ms ease, opacity 300ms ease, margin-top 300ms ease',
                }}>
                  <div className="space-y-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, smsTransactional: !f.smsTransactional }))}
                      className="w-full flex items-start gap-2 text-left py-1">
                      <div className="shrink-0 mt-[1px] w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                        style={form.smsTransactional
                          ? { background: '#8B7355', borderColor: '#8B7355' }
                          : { background: '#FDFAF5', borderColor: 'rgba(0,0,0,0.25)' }}>
                        {form.smsTransactional && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#4A443C' }}>Yes, text me about my order. </span>
                        <span style={{ fontSize: 11, lineHeight: 1.4, color: '#9A9388' }}>Transactional/service messages from Straus Tailor Shop may include order updates, pickup reminders, customer service replies, and review requests. Msg frequency varies, usually a few messages per order. Msg/data rates may apply. Reply HELP for help or STOP to opt out.</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ── Staff Details toggle ── */}
                <button
                  type="button"
                  onClick={() => setStaffOpen(o => !o)}
                  className="w-full flex items-center gap-3 py-3 transition-opacity hover:opacity-70"
                >
                  <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.10)' }} />
                  <span className="text-[10px] md:text-[13px]" style={{ fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9A9388' }}>
                    Staff Details
                  </span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9A9388" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 250ms ease', transform: staffOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.10)' }} />
                </button>

                {/* ── Collapsible staff panel ── */}
                <div ref={staffPanelRef} style={{
                  overflow: 'hidden',
                  maxHeight: staffOpen ? '900px' : '0px',
                  opacity: staffOpen ? 1 : 0,
                  marginTop: staffOpen ? undefined : 0,
                  transition: 'max-height 350ms ease, opacity 250ms ease, margin-top 300ms ease',
                }}>
                  <div className="space-y-3 pt-1 pb-1">

                    <DateField label="Need By *" value={form.dueDate} onChange={v => setForm(f => ({ ...f, dueDate: v }))} />

                    <div>
                      <span className={FL_CLASS} style={FL_STYLE}>Total Amount</span>
                      <FieldWrap fieldId="amount" focused={focused} onFocus={handleFocus} onBlur={handleBlur}>
                        <label className={`${FIELD} ${FIELD_H} cursor-text`}>
                          <div className="flex items-center flex-1">
                            <span className="shrink-0 mr-1">{I.dollar}</span>
                            <input className={INPUT} style={INPUT_STYLE} placeholder="0.00" inputMode="decimal" value={form.totalAmount}
                              onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value.replace(/[^0-9.]/g, '') }))}
                              autoComplete="off" />
                          </div>
                        </label>
                      </FieldWrap>
                    </div>

                    <div>
                      <span className={FL_CLASS} style={FL_STYLE}>Payment Status</span>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setForm(f => ({ ...f, paid: false }))}
                          className={`${FIELD_H} rounded-xl text-[16px] md:text-[18px] font-semibold transition-all`}
                          style={!form.paid
                            ? { background: '#1C1A18', color: '#F6F1E9', border: '1px solid #1C1A18', boxShadow: '0 3px 10px rgba(0,0,0,0.22)' }
                            : { background: '#FDFAF5', color: '#A89F94', border: '1px solid rgba(0,0,0,0.12)' }
                          }>
                          Unpaid
                        </button>
                        <button type="button" onClick={() => setForm(f => ({ ...f, paid: true }))}
                          className={`${FIELD_H} rounded-xl text-[16px] md:text-[18px] font-semibold transition-all`}
                          style={form.paid
                            ? { background: '#8B7355', color: '#FFFFFF', border: '1px solid #8B7355', boxShadow: '0 3px 10px rgba(139,115,85,0.30)' }
                            : { background: '#FDFAF5', color: '#A89F94', border: '1px solid rgba(0,0,0,0.12)' }
                          }>
                          Paid
                        </button>
                      </div>
                    </div>

                    {error && <p className="text-sm text-center mt-1" style={{ color: '#8B3A3A' }}>{error}</p>}

                    {(() => {
                      const isReady = !!(form.customerName.trim() && form.phone.replace(/\D/g, '').length === 10)
                      return (
                        <>
                          <p style={{
                            fontSize: 12, textAlign: 'center', marginTop: 8, marginBottom: 4,
                            color: '#9A9388', letterSpacing: '0.01em',
                            opacity: isReady ? 0 : 1,
                            transition: 'opacity 300ms ease',
                            pointerEvents: 'none',
                          }}>
                            Complete required fields to save and print.
                          </p>

                          <button
                            ref={btnRef}
                            type="submit"
                            disabled={loading}
                            className="w-full h-[56px] md:h-[62px] rounded-xl text-[15px] md:text-[17px] font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all"
                            style={{
                              opacity: 0,
                              letterSpacing: '0.04em',
                              cursor: isReady ? 'pointer' : 'not-allowed',
                              transition: 'background 200ms ease, box-shadow 200ms ease, color 200ms ease',
                              ...(isReady
                                ? { background: '#2C2118', color: '#F6F1E9', boxShadow: '0 4px 18px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.20)' }
                                : { background: '#E2DDD8', color: '#7A7268', boxShadow: 'none' }),
                            }}
                            onMouseEnter={e => { if (isReady) (e.currentTarget as HTMLButtonElement).style.background = '#3D2E20' }}
                            onMouseLeave={e => { if (isReady) (e.currentTarget as HTMLButtonElement).style.background = '#2C2118' }}
                          >
                            {loading
                              ? <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                              : null
                            }
                            {loading ? 'Saving…' : 'Save & Print Ticket'}
                          </button>
                        </>
                      )
                    })()}

                  </div>
                </div>

              </div>
            </div>
          </form>

        </div>{/* end my-auto wrapper */}
      </div>

      {order && <PrintTicket order={order} onPrint={() => window.print()} onClose={() => { setOrder(null); resetForm() }} />}
    </>
  )
}
