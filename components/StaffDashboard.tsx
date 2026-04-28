'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order, OrderStatus } from '@/lib/types'
import OrderDetail from './OrderDetail'

type Tab = 'all' | OrderStatus

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Straus Orders' },
  { key: 'active', label: 'Active' },
  { key: 'notified', label: 'Notified' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_DOT: Record<string, string> = {
  active: 'bg-amber-400',
  notified: 'bg-purple-400',
  completed: 'bg-emerald-400',
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  notified: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
}

function formatShortDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface Props {
  onCustomerForm?: () => void
}

export default function StaffDashboard({ onCustomerForm }: Props) {
  const [tab, setTab] = useState<Tab>('all')
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  const headerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams()
    if (tab !== 'all') params.set('status', tab)
    if (search) params.set('q', search)
    const res = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }, [tab, search])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
    tl.fromTo(tabsRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2')
  }, [])

  useEffect(() => {
    if (!loading && listRef.current) {
      const rows = listRef.current.querySelectorAll('.order-row')
      gsap.fromTo(
        rows,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
      )
    }
  }, [orders, loading, tab])

  function switchTab(t: Tab) {
    if (t === tab) return
    gsap.to(listRef.current, {
      opacity: 0, y: 8, duration: 0.15, ease: 'power2.in',
      onComplete: () => {
        setTab(t)
        setSelected(null)
        gsap.to(listRef.current, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' })
      },
    })
  }

  function handleSelect(order: Order) {
    setSelected(order)
  }

  function handleBack() {
    setSelected(null)
    fetchOrders()
  }

  function handleUpdate(updated: Order) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    setSelected(updated)
  }

  const counts: Record<Tab, number> = {
    all: orders.length,
    active: orders.filter((o) => o.status === 'active').length,
    notified: orders.filter((o) => o.status === 'notified').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col" style={{ background: 'radial-gradient(ellipse 80% 30% at 50% 0%, rgba(159,18,57,0.07) 0%, transparent 60%), #0a0a0a' }}>
      {/* Header */}
      <div ref={headerRef} className="px-6 pt-8 pb-4 border-b border-[#1a1a1a]" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-rose-900/30 shadow-[0_0_14px_rgba(159,18,57,0.2)]">
              <img src="/logo.png" alt="Straus" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold bg-gradient-to-r from-rose-400 to-red-300 bg-clip-text text-transparent tracking-wide">Staff Dashboard</p>
              <p className="text-[11px] text-rose-900/60">Straus Tailor Shop</p>
            </div>
          </div>
          <button
            onClick={onCustomerForm}
            className="text-xs text-[#555] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e1e] hover:border-[#2a2a2a]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Customer Form
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Tabs */}
        <div ref={tabsRef} className="px-6 pt-5 pb-3" style={{ opacity: 0 }}>
          <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-2xl p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 h-9 rounded-xl text-xs font-medium transition-all ${
                  tab === key
                    ? 'bg-white text-black'
                    : 'text-[#555] hover:text-[#888]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div ref={detailRef} className="flex-1 overflow-hidden">
            <OrderDetail order={selected} onBack={handleBack} onUpdate={handleUpdate} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col px-6 pb-6">
            {/* Search */}
            <div className="flex items-center gap-3 bg-[#111] border border-[#1e1e1e] rounded-2xl px-4 h-11 mb-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or order ID…"
                className="flex-1 bg-transparent text-sm text-white placeholder-[#333] outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-[#444] hover:text-[#888] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#444]">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
              <button
                onClick={fetchOrders}
                className="text-[10px] text-[#333] hover:text-[#666] transition-colors flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Refresh
              </button>
            </div>

            {/* Order list */}
            <div ref={listRef} className="flex-1 space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <svg className="animate-spin text-[#333]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#111] border border-[#1e1e1e] flex items-center justify-center mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#444]">No orders found</p>
                  <p className="text-xs text-[#2a2a2a] mt-1">
                    {search ? 'Try a different search' : 'Orders will appear here'}
                  </p>
                </div>
              ) : (
                orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handleSelect(order)}
                    className="order-row w-full text-left bg-[#111] border border-[#1e1e1e] rounded-2xl px-5 py-4 hover:border-[#2a2a2a] hover:bg-[#141414] transition-all group"
                    style={{ opacity: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[order.status]}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#555] shrink-0">{order.id}</span>
                            <span className="text-sm font-medium text-white truncate">{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#777]">{order.phone}</span>
                            <span className="text-[#444]">·</span>
                            <span className="text-xs text-[#777]">Due {formatShortDate(order.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {order.paid ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20">Unpaid</span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status]}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#555] transition-colors">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
