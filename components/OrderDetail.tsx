'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'
import SMSModal from './SMSModal'
import PrintTicket from './PrintTicket'

type Theme = 'dark' | 'light'

interface Props {
  order: Order
  onBack: () => void
  onUpdate: (order: Order) => void
  theme?: Theme
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10)
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  if (digits.length === 11 && digits[0] === '1')
    return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`
  return raw
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_CONFIG: Record<Theme, Record<string, { label: string; badge: string }>> = {
  dark: {
    active:    { label: 'Active',    badge: 'bg-amber-500/12 text-amber-300 border-amber-500/25' },
    notified:  { label: 'Ready',     badge: 'bg-sky-500/12 text-sky-300 border-sky-500/25' },
    completed: { label: 'Completed', badge: 'bg-white/[0.06] text-[#888] border-white/[0.1]' },
  },
  light: {
    active:    { label: 'Active',    badge: 'bg-amber-500/15 text-amber-800 border-amber-600/30' },
    notified:  { label: 'Ready',     badge: 'bg-sky-500/12 text-sky-700 border-sky-600/30' },
    completed: { label: 'Completed', badge: 'bg-black/[0.05] text-[#6B6358] border-black/[0.10]' },
  },
}

// Completed-action button colors — makes "already done" obvious at a glance
type ActiveColor = 'neutral' | 'emerald' | 'sky' | 'violet'
const ACTIVE_STYLES: Record<Theme, Record<ActiveColor, string>> = {
  dark: {
    neutral: 'bg-white/[0.08] border-white/[0.15] text-white',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    sky:     'bg-sky-500/10 border-sky-500/30 text-sky-300',
    violet:  'bg-violet-500/10 border-violet-500/30 text-violet-300',
  },
  light: {
    neutral: 'bg-black/[0.06] border-black/[0.20] text-[#1C1A18]',
    emerald: 'bg-emerald-600/10 border-emerald-600/35 text-emerald-700',
    sky:     'bg-sky-500/12 border-sky-600/35 text-sky-700',
    violet:  'bg-violet-500/10 border-violet-600/35 text-violet-700',
  },
}

export default function OrderDetail({ order: initialOrder, onBack, onUpdate, theme = 'dark' }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const [showSMS, setShowSMS] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    customerName: initialOrder.customerName,
    phone:        initialOrder.phone,
    dropoffDate:  initialOrder.dropoffDate,
    dueDate:      initialOrder.dueDate,
    totalAmount:  initialOrder.totalAmount != null ? String(initialOrder.totalAmount) : '',
  })

  const light = theme === 'light'
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = panelRef.current
    gsap.fromTo(el, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
    // Kill any in-flight tween on unmount so a detached goBack callback can't fire afterwards
    return () => { if (el) gsap.killTweensOf(el) }
  }, [])

  function goBack() {
    gsap.to(panelRef.current, {
      x: 20, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: onBack,
    })
  }

  async function saveEdits() {
    setLoadingAction('edit')
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: editForm.customerName.trim(),
          phone:        editForm.phone.trim(),
          dropoffDate:  editForm.dropoffDate,
          dueDate:      editForm.dueDate,
          totalAmount:  editForm.totalAmount !== '' ? parseFloat(editForm.totalAmount) : null,
        }),
      })
      if (!res.ok) return
      const updated: Order = await res.json()
      setOrder(updated)
      onUpdate(updated)
      setEditing(false)
    } finally {
      setLoadingAction(null)
    }
  }

  async function patchOrder(payload: Record<string, unknown>, actionKey: string) {
    setLoadingAction(actionKey)
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return
      const updated: Order = await res.json()
      setOrder(updated)
      onUpdate(updated)
    } finally {
      setLoadingAction(null)
    }
  }

  function ActionButton({
    label,
    icon,
    actionKey,
    onClick,
    active,
    activeColor = 'neutral',
    disabled,
  }: {
    label: string
    icon: React.ReactNode
    actionKey: string
    onClick: () => void
    active?: boolean
    activeColor?: ActiveColor
    disabled?: boolean
  }) {
    const isLoading = loadingAction === actionKey
    return (
      <button
        onClick={onClick}
        disabled={!!disabled || isLoading}
        className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          active
            ? ACTIVE_STYLES[theme][activeColor]
            : (light
                ? 'bg-transparent border-black/[0.12] text-[#6B6358] hover:border-black/[0.25] hover:text-[#1C1A18]'
                : 'bg-transparent border-white/[0.08] text-[#777] hover:border-white/[0.16] hover:text-white')
        }`}
      >
        {isLoading ? (
          <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          icon
        )}
        {label}
      </button>
    )
  }

  return (
    <>
      <div ref={panelRef} className="flex flex-col h-full" style={{ opacity: 0 }}>
        {/* Top bar */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${light ? 'border-black/[0.08]' : 'border-white/[0.06]'}`}>
          <button
            onClick={goBack}
            className={`flex items-center gap-1.5 text-sm font-medium h-10 px-3.5 rounded-xl border transition-all ${
              light
                ? 'text-[#4A443C] bg-[#FDFAF5] border-black/[0.15] hover:border-black/[0.30] hover:text-[#1C1A18]'
                : 'text-[#bbb] bg-white/[0.03] border-white/[0.12] hover:border-white/[0.25] hover:text-white'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm font-semibold ${light ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{order.id}</span>
            <span className={`text-[11px] px-2.5 py-[3px] rounded-full border font-semibold ${STATUS_CONFIG[theme][order.status]?.badge}`}>
              {STATUS_CONFIG[theme][order.status]?.label}
            </span>
            <button
              onClick={() => {
                if (editing) { setEditing(false) }
                else { setEditForm({ customerName: order.customerName, phone: order.phone, dropoffDate: order.dropoffDate, dueDate: order.dueDate, totalAmount: order.totalAmount != null ? String(order.totalAmount) : '' }); setEditing(true) }
              }}
              className="text-xs px-3.5 py-1.5 rounded-full border font-semibold transition-all"
              style={editing
                ? (light
                    ? { background: 'rgba(0,0,0,0.08)',      borderColor: 'rgba(0,0,0,0.25)',      color: '#1C1A18' }
                    : { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' })
                : (light
                    ? { background: 'transparent', borderColor: 'rgba(0,0,0,0.15)',      color: '#6B6358' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: '#888' })
              }
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Details */}
          <div className="space-y-0">
            {editing ? (
              <div className="space-y-3">
                {[
                  { label: 'Customer',     key: 'customerName', type: 'text'   },
                  { label: 'Phone',        key: 'phone',        type: 'tel'    },
                  { label: 'Drop-off Date',key: 'dropoffDate',  type: 'date'   },
                  { label: 'Due Date',     key: 'dueDate',      type: 'date'   },
                  { label: 'Total Amount', key: 'totalAmount',  type: 'number' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <p className={`text-[10px] uppercase tracking-widest mb-1 ${light ? 'text-[#8A847C]' : 'text-[#555]'}`}>{label}</p>
                    <input
                      type={type}
                      value={editForm[key as keyof typeof editForm]}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
                        light
                          ? 'bg-black/[0.04] border-black/[0.12] text-[#1C1A18] focus:border-black/[0.35]'
                          : 'bg-white/[0.06] border-white/[0.12] text-white focus:border-white/[0.3]'
                      }`}
                      step={type === 'number' ? '0.01' : undefined}
                    />
                  </div>
                ))}
                <button
                  onClick={saveEdits}
                  disabled={loadingAction === 'edit'}
                  className={`w-full h-11 rounded-xl text-sm font-semibold mt-1 disabled:opacity-50 flex items-center justify-center gap-2 ${
                    light ? 'bg-[#1C1A18] text-[#F6F1E9]' : 'bg-white text-black'
                  }`}
                >
                  {loadingAction === 'edit'
                    ? <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    : null}
                  {loadingAction === 'edit' ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <>
                {[
                  { label: 'Customer',     value: order.customerName },
                  { label: 'Phone',        value: formatPhone(order.phone) },
                  { label: 'Drop-off Date',value: formatDate(order.dropoffDate) },
                  { label: 'Due Date',     value: formatDate(order.dueDate) },
                  ...(order.totalAmount != null ? [{ label: 'Total Amount', value: `$${order.totalAmount.toFixed(2)}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${light ? 'border-black/[0.06]' : 'border-white/[0.05]'}`}>
                    <span className={`text-sm ${light ? 'text-[#6B6358]' : 'text-[#888]'}`}>{label}</span>
                    <span className={`text-sm font-semibold ${light ? 'text-[#1C1A18]' : 'text-white'}`}>{value}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            {order.paid ? (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                light
                  ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/25'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                Paid
              </span>
            ) : (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                light
                  ? 'bg-black/[0.04] text-[#8A847C] border-black/[0.09]'
                  : 'bg-white/[0.05] text-[#777] border-white/[0.09]'
              }`}>
                Unpaid
              </span>
            )}
            {order.pickedUp && (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                light
                  ? 'bg-black/[0.05] text-[#6B6358] border-black/[0.10]'
                  : 'bg-white/[0.06] text-[#888] border-white/[0.1]'
              }`}>
                Picked Up
              </span>
            )}
            {order.smsConsent ? (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                light
                  ? 'bg-sky-500/10 text-sky-700 border-sky-600/25'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              }`}>
                SMS Consent ✓
              </span>
            ) : (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                light
                  ? 'bg-black/[0.04] text-[#8A847C] border-black/[0.09]'
                  : 'bg-white/[0.05] text-[#777] border-white/[0.09]'
              }`}>
                No SMS Consent
              </span>
            )}
          </div>

          {/* Actions */}
          <div>
            <p className={`text-[10px] uppercase tracking-[0.18em] font-medium mb-3 ${light ? 'text-[#8A847C]' : 'text-[#555]'}`}>Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label={order.paid ? 'Paid ✓' : 'Mark Paid'}
                actionKey="paid"
                active={order.paid}
                activeColor="emerald"
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                onClick={() => patchOrder({ paid: !order.paid }, 'paid')}
              />
              {order.smsConsent ? (
                <ActionButton
                  label="Send SMS"
                  actionKey="sms"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  }
                  onClick={() => setShowSMS(true)}
                />
              ) : (
                <ActionButton
                  label={order.status === 'notified' ? 'Called ✓' : 'Mark Called'}
                  actionKey="called"
                  active={order.status === 'notified'}
                  activeColor="sky"
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z"/>
                    </svg>
                  }
                  onClick={() => {
                    patchOrder({ status: 'notified', notifiedAt: [new Date().toISOString()] }, 'called')
                  }}
                />
              )}
              <ActionButton
                label={order.pickedUp ? 'Picked Up ✓' : 'Mark Picked Up'}
                actionKey="pickedUp"
                active={order.pickedUp}
                activeColor="violet"
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                }
                onClick={() =>
                  patchOrder(
                    { pickedUp: !order.pickedUp, status: !order.pickedUp ? 'completed' : order.status },
                    'pickedUp'
                  )
                }
              />
              <ActionButton
                label="Reprint"
                actionKey="print"
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                }
                onClick={() => setShowPrint(true)}
              />
            </div>
          </div>

          {/* Meta */}
          <div className={`space-y-2 pt-2 border-t ${light ? 'border-black/[0.08]' : 'border-white/[0.06]'}`}>
            <div className="flex justify-between">
              <span className={`text-xs ${light ? 'text-[#8A847C]' : 'text-[#666]'}`}>Created</span>
              <span className={`text-xs ${light ? 'text-[#4A443C]' : 'text-[#aaa]'}`}>
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            {order.pickedUpAt && (
              <div className="flex justify-between">
                <span className={`text-xs ${light ? 'text-[#8A847C]' : 'text-[#666]'}`}>Picked Up</span>
                <span className={`text-xs ${light ? 'text-[#4A443C]' : 'text-[#aaa]'}`}>
                  {new Date(order.pickedUpAt).toLocaleString()}
                </span>
              </div>
            )}
            {(() => {
              const times: string[] = Array.isArray(order.notifiedAt)
                ? order.notifiedAt
                : order.notifiedAt
                  ? [order.notifiedAt as unknown as string]
                  : []
              return times.map((t, i) => (
                <div key={t} className="flex justify-between">
                  <span className={`text-xs ${light ? 'text-[#8A847C]' : 'text-[#666]'}`}>
                    SMS {times.length > 1 ? `#${i + 1}` : 'Sent'}
                  </span>
                  <span className={`text-xs ${light ? 'text-sky-700/80' : 'text-sky-400/70'}`}>
                    {new Date(t).toLocaleString()}
                  </span>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      {showSMS && (
        <SMSModal
          order={order}
          onClose={() => setShowSMS(false)}
          onSent={(updated) => {
            setOrder(updated)
            onUpdate(updated)
            setShowSMS(false)
          }}
        />
      )}

      {showPrint && (
        <PrintTicket
          order={order}
          onPrint={() => window.print()}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  )
}
