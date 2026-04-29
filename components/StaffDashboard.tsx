'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order, OrderStatus } from '@/lib/types'
import OrderDetail from './OrderDetail'

type Tab = 'all' | OrderStatus

const TABS: { key: Tab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'notified',  label: 'Ready' },
  { key: 'completed', label: 'Completed' },
]

// Job status config — "notified" displays as "Ready"
const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  active:    { label: 'Active',     badge: 'bg-amber-500/12 text-amber-300 border border-amber-500/25' },
  notified:  { label: 'Ready',      badge: 'bg-sky-500/12 text-sky-300 border border-sky-500/25' },
  completed: { label: 'Completed',  badge: 'bg-white/[0.06] text-[#888] border border-white/[0.09]' },
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10)
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits[0] === '1')
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`
  return raw
}

function getDueInfo(iso: string): { top: string; bottom: string; color: string; bg: string; ring: string; overdue: boolean } {
  if (!iso) return { top: '—', bottom: '', color: 'text-[#555]', bg: 'bg-[#1a1a1a]', ring: '', overdue: false }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(iso + 'T00:00:00')
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0)   return { top: `${Math.abs(diff)}d`, bottom: 'late',  color: 'text-red-400',      bg: 'bg-red-500/12',    ring: 'ring-1 ring-red-500/30', overdue: true  }
  if (diff === 0) return { top: 'Today',              bottom: 'due',   color: 'text-amber-300',    bg: 'bg-amber-500/12',  ring: 'ring-1 ring-amber-500/25', overdue: false }
  if (diff === 1) return { top: '1d',                 bottom: 'left',  color: 'text-amber-300',    bg: 'bg-amber-500/12',  ring: 'ring-1 ring-amber-500/20', overdue: false }
  if (diff <= 3)  return { top: `${diff}d`,           bottom: 'left',  color: 'text-amber-300/70', bg: 'bg-amber-500/8',   ring: '', overdue: false }
  if (diff <= 7)  return { top: `${diff}d`,           bottom: 'left',  color: 'text-[#777]',       bg: 'bg-[#1e1e1e]',    ring: '', overdue: false }
  return                  { top: `${diff}d`,          bottom: 'left',  color: 'text-[#555]',       bg: 'bg-[#181818]',    ring: '', overdue: false }
}

interface Props { onCustomerForm?: () => void }

export default function StaffDashboard({ onCustomerForm }: Props) {
  const [tab, setTab]         = useState<Tab>('all')
  const [orders, setOrders]   = useState<Order[]>([])
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

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
    tl.fromTo(headerRef.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' })
    tl.fromTo(tabsRef.current,   { y: -8,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.2')
  }, [])

  useEffect(() => {
    if (!loading && listRef.current) {
      gsap.fromTo(listRef.current.querySelectorAll('.order-row'),
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

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div ref={headerRef} className="px-6 pt-7 pb-4 border-b border-white/[0.06]" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div>
            <p className="text-sm font-semibold text-white tracking-wide">Staff Dashboard</p>
            <p className="text-[11px] text-[#555] mt-0.5">Straus Tailor Shop</p>
          </div>
          <button onClick={onCustomerForm}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-[#9CA3AF] hover:text-white transition-all border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.04]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Customer Form
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Tabs */}
        <div ref={tabsRef} className="px-6 pt-4 pb-3" style={{ opacity: 0 }}>
          <div className="flex gap-1 bg-[#111] border border-white/[0.06] rounded-xl p-1">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => switchTab(key)}
                className={`flex-1 h-9 rounded-lg text-xs font-semibold transition-all ${
                  tab === key ? 'bg-white text-black' : 'text-[#666] hover:text-[#aaa]'
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
              onBack={() => { setSelected(null); fetchOrders() }}
              onUpdate={(u) => { setOrders(p => p.map(o => o.id === u.id ? u : o)); setSelected(u) }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-6 pb-6">
            {/* Search */}
            <div className="flex items-center gap-3 bg-[#111] border border-white/[0.06] rounded-xl px-4 h-11 mb-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, phone, or order ID…"
                className="flex-1 bg-transparent text-sm text-white placeholder-[#444] outline-none"/>
              {search && (
                <button onClick={() => setSearch('')} className="text-[#444] hover:text-[#888] transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] text-[#555]">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
              <button onClick={fetchOrders}
                className="text-[10px] text-[#444] hover:text-[#888] transition-colors flex items-center gap-1">
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
                  <svg className="animate-spin text-[#333]" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-[#444]">No orders found</p>
                  <p className="text-xs text-[#2a2a2a] mt-1">{search ? 'Try a different search' : 'Orders will appear here'}</p>
                </div>
              ) : orders.map((order) => {
                const due = getDueInfo(order.dueDate)
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelected(order)}
                    className={`order-row w-full text-left rounded-2xl px-4 py-3.5 transition-all group ${
                      due.overdue
                        ? 'bg-red-500/[0.05] border border-red-500/[0.18] hover:bg-red-500/[0.08]'
                        : 'bg-[#111] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#151515]'
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
                        <p className="text-[15px] font-semibold text-white truncate leading-tight">{order.customerName}</p>
                        <p className="text-[12px] text-[#777] mt-0.5 leading-tight">{formatPhone(order.phone)}</p>
                        <p className="text-[10px] font-mono text-[#444] mt-0.5 leading-tight">{order.id}</p>
                      </div>

                      {/* Status column — job status primary, payment secondary */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Primary: job status */}
                        <span className={`text-[11px] px-2.5 py-[3px] rounded-full font-semibold ${STATUS_CONFIG[order.status]?.badge}`}>
                          {STATUS_CONFIG[order.status]?.label}
                        </span>
                        {/* Secondary: payment */}
                        {order.paid ? (
                          <span className="text-[9px] px-2 py-[2px] rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>
                        ) : (
                          <span className="text-[9px] px-2 py-[2px] rounded-full font-medium bg-white/[0.04] text-[#555] border border-white/[0.07]">Unpaid</span>
                        )}
                      </div>

                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:stroke-[#666] transition-colors">
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
