'use client'

import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'

interface Props {
  order: Order
  onPrint: () => void
  onClose: () => void
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

/* ── Thermal receipt layout — used only for printing ─────── */
function ThermalBody({ order }: { order: Order }) {
  const s = {
    wrap:    { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', color: '#000', background: '#fff', width: '72mm', padding: '3mm 4mm' } as React.CSSProperties,
    center:  { textAlign: 'center' as const },
    dash:    { borderTop: '1px dashed #000', margin: '5px 0' } as React.CSSProperties,
    label:   { fontSize: '9px', letterSpacing: '1.5px', color: '#555', textTransform: 'uppercase' as const },
    row:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '6px' } as React.CSSProperties,
    rowVal:  { fontSize: '11px', fontWeight: '600', textAlign: 'right' as const, maxWidth: '45mm', wordBreak: 'break-word' as const },
  }
  const rows = [
    ['Customer', order.customerName],
    ['Phone',    order.phone],
    ['Drop-off', formatDate(order.dropoffDate)],
    ['Due Date', formatDate(order.dueDate)],
    ...(order.totalAmount != null ? [['Total',     `$${order.totalAmount.toFixed(2)}`]] : []),
    ...(order.itemCount   != null ? [['Items',     `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}`]] : []),
  ]
  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={{ ...s.center, paddingBottom: '4px' }}>
        <p style={{ fontSize: '20px', fontFamily: 'var(--font-dancing)', lineHeight: 1.1, marginBottom: '2px' }}>Straus Tailor Shop</p>
        <p style={{ fontSize: '10px', lineHeight: 1.4 }}>1326 25th St S Suite B, Fargo, ND 58103</p>
        <p style={{ fontSize: '10px', lineHeight: 1.4 }}>(701) 929-8262</p>
      </div>

      <div style={s.dash} />

      {/* Order ID */}
      <div style={{ ...s.center, padding: '4px 0' }}>
        <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', marginBottom: '2px' }}>ORDER ID</p>
        <p style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>{order.id}</p>
        <div style={{ marginTop: '6px', display: 'inline-block', border: '1px solid #000', borderRadius: '50px', padding: '2px 10px', fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px' }}>
          {order.paid ? '✓ PAID' : 'UNPAID'}
        </div>
      </div>

      <div style={s.dash} />

      {/* Details */}
      <div style={{ padding: '2px 0' }}>
        {rows.map(([label, value]) => (
          <div key={label} style={s.row}>
            <span style={s.label}>{label}</span>
            <span style={s.rowVal}>{value}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <>
          <div style={s.dash} />
          <div>
            <p style={{ ...s.label, marginBottom: '3px' }}>Notes</p>
            <p style={{ fontSize: '11px', fontWeight: '700', whiteSpace: 'pre-wrap' }}>{order.notes}</p>
          </div>
        </>
      )}

      <div style={s.dash} />

      {/* Footer */}
      <p style={{ ...s.center, fontSize: '10px', color: '#555', paddingTop: '2px' }}>
        Thank you for your business!
      </p>
    </div>
  )
}

/* ── Visual card layout — shown on screen ─────────────────── */
function TicketBody({ order }: { order: Order }) {
  return (
    <div className="bg-white text-black w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="pt-7 pb-4 px-8 flex flex-col items-center border-b border-gray-200">
        <p className="text-[28px] text-gray-800 leading-none" style={{ fontFamily: 'var(--font-dancing)' }}>
          Straus Tailor Shop
        </p>
        <p className="text-[11px] text-gray-500 mt-1">1326 25th St S Suite B, Fargo, ND 58103</p>
        <p className="text-[11px] text-gray-500">(701) 929-8262</p>
      </div>

      {/* Order ID + paid badge */}
      <div className="py-5 flex flex-col items-center border-b border-dashed border-gray-200">
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-1.5">Order ID</p>
        <p className="text-5xl font-bold tracking-tight text-black">{order.id}</p>
        <span className={`mt-3 px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${
          order.paid
            ? 'text-emerald-700 border-emerald-400 bg-emerald-50'
            : 'text-red-600 border-red-300 bg-red-50'
        }`}>
          {order.paid ? '✓ Paid' : 'Unpaid'}
        </span>
      </div>

      {/* Details */}
      <div className="px-8 py-4 space-y-3 border-b border-dashed border-gray-200">
        {[
          { icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, label: 'Customer', value: order.customerName },
          { icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.07 2H6a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17z" />, label: 'Phone', value: order.phone },
          { icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, label: 'Drop-off', value: formatDate(order.dropoffDate) },
          { icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>, label: 'Due Date', value: formatDate(order.dueDate) },
          ...(order.totalAmount != null ? [{ icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>, label: 'Total', value: `$${order.totalAmount.toFixed(2)}` }] : []),
          ...(order.itemCount   != null ? [{ icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>, label: 'Items', value: `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}` }] : []),
        ].map(({ label, value, icon }) => (
          <div key={label} className="flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5 shrink-0">
              {icon}
            </svg>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900 leading-snug">{value || '—'}</p>
            </div>
          </div>
        ))}

        {order.notes && (
          <div className="flex items-start gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mt-0.5 shrink-0">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Notes</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug whitespace-pre-wrap">{order.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 flex items-center justify-center">
        <p className="text-[11px] text-gray-400 tracking-wide">Thank you for your business!</p>
      </div>
    </div>
  )
}

export default function PrintTicket({ order, onClose }: Omit<Props, 'onPrint'> & { onPrint?: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [printed, setPrinted]   = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const ticketRef   = useRef<HTMLDivElement>(null)
  const actionsRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const tl = gsap.timeline()
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    tl.fromTo(ticketRef.current, { y: -40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }, '-=0.1')
    tl.fromTo(actionsRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1')
  }, [])

  function handleClose() {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(ticketRef.current,  { y: -20, opacity: 0, scale: 0.97, duration: 0.25, ease: 'power2.in' })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.1')
  }

  async function handlePrint() {
    if (printing || printed) return
    setPrinting(true)
    try {
      const res = await fetch('/api/printer/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      })
      if (!res.ok) throw new Error(`Queue failed: ${res.status}`)
      setPrinted(true)
      // Auto-close after 1.5s so staff can move on
      setTimeout(handleClose, 1500)
    } catch (err) {
      console.error('Print queue error:', err)
      setPrinting(false)
      // Fallback: open browser print dialog with thermal layout
      window.print()
    }
  }

  return (
    <>
      {/* Screen overlay */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm p-6"
        style={{ opacity: 0 }}
      >
        <div
          ref={ticketRef}
          className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
          style={{ opacity: 0 }}
        >
          <TicketBody order={order} />
        </div>

        <div ref={actionsRef} className="flex gap-3 mt-6 w-full max-w-sm" style={{ opacity: 0 }}>
          <button
            onClick={handleClose}
            className="flex-1 h-12 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            disabled={printing || printed}
            className={`flex-1 h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              printed
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {printed ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sent to Printer!
              </>
            ) : printing ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Ticket
              </>
            )}
          </button>
        </div>
      </div>

      {/* Print-only portal — thermal 80mm receipt layout */}
      {mounted && createPortal(
        <div id="print-ticket" style={{ position: 'fixed', left: '-9999px', top: 0 }} aria-hidden="true">
          <ThermalBody order={order} />
        </div>,
        document.body
      )}
    </>
  )
}
