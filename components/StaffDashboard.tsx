'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order, OrderStatus } from '@/lib/types'
import OrderDetail from './OrderDetail'

type Tab = 'all' | OrderStatus
export type Theme = 'dark' | 'light'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'notified',  label: 'Ready' },
  { key: 'completed', label: 'Completed' },
]

// Job status config — "notified" displays as "Ready"
const STATUS_CONFIG: Record<Theme, Record<string, { label: string; badge: string }>> = {
  dark: {
    active:    { label: 'Active',     badge: 'bg-amber-500/12 text-amber-300 border border-amber-500/25' },
    notified:  { label: 'Ready',      badge: 'bg-sky-500/12 text-sky-300 border border-sky-500/25' },
    completed: { label: 'Completed',  badge: 'bg-white/[0.06] text-[#888] border border-white/[0.09]' },
  },
  light: {
    active:    { label: 'Active',     badge: 'bg-amber-500/15 text-amber-800 border border-amber-600/30' },
    notified:  { label: 'Ready',      badge: 'bg-sky-500/12 text-sky-700 border border-sky-600/30' },
    completed: { label: 'Completed',  badge: 'bg-black/[0.05] text-[#6B6358] border border-black/[0.10]' },
  },
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10)
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits[0] === '1')
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`
  return raw
}

function getDueInfo(iso: string, theme: Theme): { top: string; bottom: string; color: string; bg: string; ring: string; overdue: boolean } {
  const light = theme === 'light'
  if (!iso) return { top: '—', bottom: '', color: light ? 'text-[#8A847C]' : 'text-[#555]', bg: light ? 'bg-black/[0.05]' : 'bg-[#1a1a1a]', ring: '', overdue: false }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(iso + 'T00:00:00')
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0)   return light
    ? { top: `${Math.abs(diff)}d`, bottom: 'late',  color: 'text-red-700',      bg: 'bg-red-600/12',    ring: 'ring-1 ring-red-600/30', overdue: true  }
    : { top: `${Math.abs(diff)}d`, bottom: 'late',  color: 'text-red-400',      bg: 'bg-red-500/12',    ring: 'ring-1 ring-red-500/30', overdue: true  }
  if (diff === 0) return light
    ? { top: 'Today',              bottom: 'due',   color: 'text-amber-800',    bg: 'bg-amber-500/15',  ring: 'ring-1 ring-amber-600/30', overdue: false }
    : { top: 'Today',              bottom: 'due',   color: 'text-amber-300',    bg: 'bg-amber-500/12',  ring: 'ring-1 ring-amber-500/25', overdue: false }
  if (diff === 1) return light
    ? { top: '1d',                 bottom: 'left',  color: 'text-amber-800',    bg: 'bg-amber-500/15',  ring: 'ring-1 ring-amber-600/25', overdue: false }
    : { top: '1d',                 bottom: 'left',  color: 'text-amber-300',    bg: 'bg-amber-500/12',  ring: 'ring-1 ring-amber-500/20', overdue: false }
  if (diff <= 3)  return light
    ? { top: `${diff}d`,           bottom: 'left',  color: 'text-amber-800/70', bg: 'bg-amber-500/10',  ring: '', overdue: false }
    : { top: `${diff}d`,           bottom: 'left',  color: 'text-amber-300/70', bg: 'bg-amber-500/8',   ring: '', overdue: false }
  if (diff <= 7)  return light
    ? { top: `${diff}d`,           bottom: 'left',  color: 'text-[#6B6358]',    bg: 'bg-black/[0.05]',  ring: '', overdue: false }
    : { top: `${diff}d`,           bottom: 'left',  color: 'text-[#777]',       bg: 'bg-[#1e1e1e]',    ring: '', overdue: false }
  return light
    ? { top: `${diff}d`,           bottom: 'left',  color: 'text-[#8A847C]',    bg: 'bg-black/[0.04]',  ring: '', overdue: false }
    : { top: `${diff}d`,           bottom: 'left',  color: 'text-[#555]',       bg: 'bg-[#181818]',    ring: '', overdue: false }
}

interface Props { onCustomerForm?: () => void }

export default function StaffDashboard({ onCustomerForm }: Props) {
  const [tab, setTab]         = useState<Tab>('all')
  const [orders, setOrders]   = useState<Order[]>([])
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [reminderState, setReminderState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'none'>('idle')
  const [reminderMsg, setReminderMsg] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')

  // Load saved theme (per-device)
  useEffect(() => {
    if (localStorage.getItem('straus_staff_theme') === 'light') setTheme('light')
  }, [])

  function toggleTheme() {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('straus_staff_theme', next)
      return next
    })
  }

  const light = theme === 'light'

  async function sendReminders() {
    setReminderState('sending')
    try {
      const res = await fetch('/api/staff/send-reminders')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.sent === 0) {
        setReminderState('none')
        setReminderMsg('No orders due today or tomorrow')
      } else {
        setReminderState('sent')
        setReminderMsg(`Sent for ${data.sent} order${data.sent > 1 ? 's' : ''}`)
      }
    } catch {
      setReminderState('error')
      setReminderMsg('Failed to send')
    }
    setTimeout(() => { setReminderState('idle'); setReminderMsg('') }, 4000)
  }

  const headerRef = useRef<HTMLDivElement>(null)
  const tabsRef   = useRef<HTMLDivElement>(null)
  const listRef   = useRef<HTMLDivElement>(null)

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams()
    if (tab !== 'all') params.set('status', tab)
    if (search) params.set('q', search)
    const res = await fetch(`/api/orders?${params}`)
    setOrders(await res.json())
    setLoading(false)
  }, [tab, search])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    const tl = gsap.timeline()
    if (headerRef.current) tl.fromTo(headerRef.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
    if (tabsRef.current)   tl.fromTo(tabsRef.current,   { y: -8,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.2')
  }, [])

  useEffect(() => {
    if (!loading && listRef.current) {
      const rows = listRef.current.querySelectorAll('.order-row')
      if (rows.length) gsap.fromTo(rows,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.04, ease: 'power2.out' }
      )
    }
  }, [orders, loading, tab])

  function switchTab(t: Tab) {
    if (t === tab) return
    gsap.to(listRef.current, {
      opacity: 0, y: 6, duration: 0.12, ease: 'power2.in',
      onComplete: () => {
        setTab(t); setSelected(null)
        gsap.to(listRef.current, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' })
      },
    })
  }

  // Header button colors per theme (inline styles for the reminder button states)
  const btnIdle = light
    ? { color: '#6B6358', borderColor: 'rgba(0,0,0,0.12)', background: 'transparent' }
    : { color: '#9CA3AF', borderColor: 'rgba(255,255,255,0.08)', background: 'transparent' }
  const btnMuted = light
    ? { color: '#8A847C', borderColor: 'rgba(0,0,0,0.12)', background: 'transparent' }
    : { color: '#888',    borderColor: 'rgba(255,255,255,0.08)', background: 'transparent' }
  const btnSent = light
    ? { color: '#15803d', borderColor: 'rgba(21,128,61,0.30)',  background: 'rgba(21,128,61,0.08)' }
    : { color: '#4ade80', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.08)' }
  const btnError = light
    ? { color: '#b91c1c', borderColor: 'rgba(185,28,28,0.30)',  background: 'rgba(185,28,28,0.08)' }
    : { color: '#f87171', borderColor: 'rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)' }

  return (
    <div className={`min-h-screen flex flex-col ${light ? 'bg-[#F1EBE1]' : 'bg-[#0a0a0a]'}`}>
      {/* Header */}
      <div ref={headerRef} className={`px-6 pt-7 pb-4 border-b ${light ? 'border-black/[0.08]' : 'border-white/[0.06]'}`} style={{ opacity: 0 }}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            <p className={`text-sm font-semibold tracking-wide ${light ? 'text-[#1C1A18]' : 'text-white'}`}>Staff Dashboard</p>
            <p className={`text-[11px] mt-0.5 ${light ? 'text-[#8A847C]' : 'text-[#555]'}`}>Straus Tailor Shop</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={light ? 'Switch to dark mode' : 'Switch to light mode'}
              className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all"
              style={btnIdle}
            >
              {light ? (
                /* moon — switch back to dark */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                /* sun — switch to light */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>

            {/* Send Reminders button */}
            <button
              onClick={sendReminders}
              disabled={reminderState === 'sending'}
              title="Send SMS reminders for orders due today or tomorrow"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all border"
              style={
                reminderState === 'sent'    ? btnSent :
                reminderState === 'error'   ? btnError :
                reminderState === 'none'    ? btnMuted :
                reminderState === 'sending' ? btnMuted :
                                              btnIdle
              }
            >
              {reminderState === 'sending' ? (
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : reminderState === 'sent' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : reminderState === 'error' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              )}
              {reminderState === 'sending' ? 'Sending…' :
               reminderState === 'sent'    ? reminderMsg :
               reminderState === 'error'   ? reminderMsg :
               reminderState === 'none'    ? reminderMsg :
               'Reminders'}
            </button>

            <button onClick={onCustomerForm}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                light
                  ? 'text-[#6B6358] hover:text-[#1C1A18] border-black/[0.12] hover:border-black/[0.25] hover:bg-black/[0.04]'
                  : 'text-[#9CA3AF] hover:text-white border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.04]'
              }`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Customer Form
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Tabs */}
        <div ref={tabsRef} className="px-6 pt-4 pb-3" style={{ opacity: 0 }}>
          <div className={`flex gap-1 border rounded-xl p-1 ${light ? 'bg-[#FDFAF5] border-black/[0.08]' : 'bg-[#111] border-white/[0.06]'}`}>
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => switchTab(key)}
                className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all ${
                  tab === key
                    ? (light ? 'bg-[#1C1A18] text-[#F6F1E9]' : 'bg-white text-black')
                    : (light ? 'text-[#8A847C] hover:text-[#4A443C]' : 'text-[#666] hover:text-[#aaa]')
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="flex-1 overflow-hidden">
            <OrderDetail
              order={selected}
              theme={theme}
              onBack={() => { setSelected(null); fetchOrders() }}
              onUpdate={(u) => { setOrders(p => p.map(o => o.id === u.id ? u : o)); setSelected(u) }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-6 pb-6">
            {/* Search */}
            <div className={`flex items-center gap-3 border rounded-xl px-4 h-11 mb-3 ${light ? 'bg-[#FDFAF5] border-black/[0.10]' : 'bg-[#111] border-white/[0.06]'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={light ? '#8A847C' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone, or order ID…"
                className={`flex-1 bg-transparent text-sm outline-none ${light ? 'text-[#1C1A18] placeholder-[#A89F94]' : 'text-white placeholder-[#444]'}`}/>
              {search && (
                <button onClick={() => setSearch('')} className={`transition-colors ${light ? 'text-[#A89F94] hover:text-[#6B6358]' : 'text-[#444] hover:text-[#888]'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between mb-2.5">
              <p className={`text-[11px] ${light ? 'text-[#8A847C]' : 'text-[#555]'}`}>
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
              <button onClick={fetchOrders}
                className={`text-[10px] transition-colors flex items-center gap-1 ${light ? 'text-[#A89F94] hover:text-[#4A443C]' : 'text-[#444] hover:text-[#888]'}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>

            {/* Order list */}
            <div ref={listRef} className="flex-1 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <svg className={`animate-spin ${light ? 'text-[#C9C2B6]' : 'text-[#333]'}`} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className={`text-sm ${light ? 'text-[#8A847C]' : 'text-[#444]'}`}>No orders found</p>
                  <p className={`text-xs mt-1 ${light ? 'text-[#C9C2B6]' : 'text-[#2a2a2a]'}`}>{search ? 'Try a different search' : 'Orders will appear here'}</p>
                </div>
              ) : [...orders].sort((a, b) => {
                  if (tab === 'all') {
                    // Most recently created first
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  }
                  // All other tabs: soonest due / most overdue first
                  if (!a.dueDate && !b.dueDate) return 0
                  if (!a.dueDate) return 1
                  if (!b.dueDate) return -1
                  return a.dueDate.localeCompare(b.dueDate)
                }).map((order) => {
                const dueRaw = getDueInfo(order.dueDate, theme)
                // Completed orders are done — never show overdue styling
                const due = order.status === 'completed'
                  ? { ...dueRaw, overdue: false, color: light ? 'text-[#8A847C]' : 'text-[#555]', bg: light ? 'bg-black/[0.04]' : 'bg-[#181818]', ring: '' }
                  : dueRaw
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className={`order-row w-full text-left rounded-2xl px-4 py-3.5 transition-all group border ${
                      due.overdue
                        ? (light
                            ? 'bg-red-600/[0.06] border-red-600/[0.22] hover:bg-red-600/[0.09]'
                            : 'bg-red-500/[0.05] border-red-500/[0.18] hover:bg-red-500/[0.08]')
                        : (light
                            ? 'bg-[#FDFAF5] border-black/[0.08] hover:border-black/[0.16] hover:bg-[#FFFDF9]'
                            : 'bg-[#111] border-white/[0.06] hover:border-white/[0.12] hover:bg-[#151515]')
                    }`}
                    style={{ opacity: 0 }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Urgency badge */}
                      <div className={`shrink-0 w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl ${due.bg} ${due.ring} flex flex-col items-center justify-center`}>
                        <span className={`text-[13px] font-bold leading-none ${due.color}`}>{due.top}</span>
                        {due.bottom && <span className={`text-[8px] leading-none mt-1 ${due.color} opacity-80 tracking-wide uppercase`}>{due.bottom}</span>}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <p className={`text-[15px] font-semibold truncate leading-tight ${light ? 'text-[#1C1A18]' : 'text-white'}`}>{order.customerName}</p>
                          <span className={`text-[12px] font-mono font-semibold shrink-0 ${light ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{order.id}</span>
                        </div>
                        <p className={`text-[12px] mt-0.5 leading-tight ${light ? 'text-[#6B6358]' : 'text-[#777]'}`}>{formatPhone(order.phone)}</p>
                      </div>

                      {/* Status column — job status primary, payment secondary */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Primary: job status */}
                        <span className={`text-[11px] px-2.5 py-[3px] rounded-full font-semibold ${STATUS_CONFIG[theme][order.status]?.badge}`}>
                          {STATUS_CONFIG[theme][order.status]?.label}
                        </span>
                        {/* Secondary: payment */}
                        {order.paid ? (
                          <span className={`text-[9px] px-2 py-[2px] rounded-full font-medium border ${
                            light
                              ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/25'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>Paid</span>
                        ) : (
                          <span className={`text-[9px] px-2 py-[2px] rounded-full font-medium border ${
                            light
                              ? 'bg-black/[0.04] text-[#8A847C] border-black/[0.08]'
                              : 'bg-white/[0.04] text-[#555] border-white/[0.07]'
                          }`}>Unpaid</span>
                        )}
                      </div>

                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={light ? '#C9C2B6' : '#333'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`shrink-0 transition-colors ${light ? 'group-hover:stroke-[#6B6358]' : 'group-hover:stroke-[#666]'}`}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
