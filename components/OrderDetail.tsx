'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'
import SMSModal from './SMSModal'
import PrintTicket from './PrintTicket'

interface Props {
  order: Order
  onBack: () => void
  onUpdate: (order: Order) => void
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

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  active:    { label: 'Active',    badge: 'bg-amber-500/12 text-amber-300 border-amber-500/25' },
  notified:  { label: 'Ready',     badge: 'bg-sky-500/12 text-sky-300 border-sky-500/25' },
  completed: { label: 'Completed', badge: 'bg-white/[0.06] text-[#888] border-white/[0.1]' },
}

export default function OrderDetail({ order: initialOrder, onBack, onUpdate }: Props) {
  const [order, setOrder] = useState(initialOrder)
  const [showSMS, setShowSMS] = useState(false)
  const [showPrint, setShowPrint] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(panelRef.current, { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' })
  }, [])

  function goBack() {
    gsap.to(panelRef.current, {
      x: 20, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: onBack,
    })
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
    disabled,
  }: {
    label: string
    icon: React.ReactNode
    actionKey: string
    onClick: () => void
    active?: boolean
    disabled?: boolean
  }) {
    const isLoading = loadingAction === actionKey
    return (
      <button
        onClick={onClick}
        disabled={!!disabled || isLoading}
        className={`flex items-center gap-2 h-11 px-4 rounded-xl border text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          active
            ? 'bg-white/[0.08] border-white/[0.15] text-white'
            : 'bg-transparent border-white/[0.08] text-[#777] hover:border-white/[0.16] hover:text-white'
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
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-[#666] hover:text-white transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#888] font-mono text-sm">{order.id}</span>
            <span className={`text-[11px] px-2.5 py-[3px] rounded-full border font-semibold ${STATUS_CONFIG[order.status]?.badge}`}>
              {STATUS_CONFIG[order.status]?.label}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Details */}
          <div className="space-y-3">
            {[
              { label: 'Customer', value: order.customerName },
              { label: 'Phone', value: formatPhone(order.phone) },
              { label: 'Drop-off Date', value: formatDate(order.dropoffDate) },
              { label: 'Due Date', value: formatDate(order.dueDate) },
              ...(order.totalAmount != null ? [{ label: 'Total Amount', value: `$${order.totalAmount.toFixed(2)}` }] : []),
              ...(order.itemCount    != null ? [{ label: 'Items', value: `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}` }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/[0.05] last:border-0">
                <span className="text-sm text-[#888]">{label}</span>
                <span className="text-sm text-white font-semibold">{value}</span>
              </div>
            ))}
            {order.notes && (
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-[#555] block mb-1.5">Notes</span>
                <p className="text-sm text-white bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3 leading-relaxed">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Status badges */}
          <div className="flex gap-2 flex-wrap">
            {order.paid ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Paid
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-white/[0.05] text-[#777] border border-white/[0.09] font-medium">
                Unpaid
              </span>
            )}
            {order.pickedUp && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/[0.06] text-[#888] border border-white/[0.1] font-medium">
                Picked Up
              </span>
            )}
          </div>

          {/* Actions */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#555] font-medium mb-3">Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                label={order.paid ? 'Paid ✓' : 'Mark Paid'}
                actionKey="paid"
                active={order.paid}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                onClick={() => patchOrder({ paid: !order.paid }, 'paid')}
              />
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
              <ActionButton
                label={order.pickedUp ? 'Picked Up ✓' : 'Mark Picked Up'}
                actionKey="pickedUp"
                active={order.pickedUp}
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
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="flex justify-between">
              <span className="text-xs text-[#666]">Created</span>
              <span className="text-xs text-[#aaa]">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            {order.pickedUpAt && (
              <div className="flex justify-between">
                <span className="text-xs text-[#666]">Picked Up</span>
                <span className="text-xs text-[#aaa]">
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
                  <span className="text-xs text-[#666]">
                    SMS {times.length > 1 ? `#${i + 1}` : 'Sent'}
                  </span>
                  <span className="text-xs text-sky-400/70">
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
