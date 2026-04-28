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

function TicketBody({ order }: { order: Order }) {
  return (
    <div className="bg-white text-black w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="pt-10 pb-6 px-8 flex flex-col items-center border-b border-gray-200">
        <p className="text-[28px] text-gray-800 leading-none" style={{ fontFamily: 'var(--font-dancing)' }}>
          Straus Tailor Shop
        </p>
        <p className="text-[10px] tracking-[0.28em] text-gray-400 uppercase mt-2">Order Ticket</p>
      </div>

      {/* Order ID + paid badge */}
      <div className="py-8 flex flex-col items-center border-b border-dashed border-gray-200">
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-2">Order ID</p>
        <p className="text-5xl font-bold tracking-tight text-black">{order.id}</p>
        <span className={`mt-4 px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${
          order.paid
            ? 'text-emerald-700 border-emerald-400 bg-emerald-50'
            : 'text-red-600 border-red-300 bg-red-50'
        }`}>
          {order.paid ? '✓ Paid' : 'Unpaid'}
        </span>
      </div>

      {/* Details */}
      <div className="px-8 py-6 space-y-4 border-b border-dashed border-gray-200">
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
              <p className="text-sm text-gray-800 leading-snug whitespace-pre-wrap">{order.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 py-5 flex flex-col items-center gap-1 text-center border-t border-gray-100">
        <p className="text-sm text-gray-700" style={{ fontFamily: 'var(--font-dancing)' }}>Straus Tailor Shop</p>
        <p className="text-[11px] text-gray-500">1326 25th St S Suite B, Fargo, ND 58103</p>
        <p className="text-[11px] text-gray-500">(701) 929-8262</p>
        <p className="text-[10px] text-gray-400 mt-1 tracking-wide">Thank you for your business!</p>
      </div>
    </div>
  )
}

export default function PrintTicket({ order, onPrint, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const backdropRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const tl = gsap.timeline()
    tl.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    tl.fromTo(ticketRef.current, { y: -40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }, '-=0.1')
    tl.fromTo(actionsRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1')
  }, [])

  function handleClose() {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(ticketRef.current, { y: -20, opacity: 0, scale: 0.97, duration: 0.25, ease: 'power2.in' })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.2 }, '-=0.1')
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
            onClick={onPrint}
            className="flex-1 h-12 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Ticket
          </button>
        </div>
      </div>

      {/* Print-only portal — direct child of <body> so display:none on siblings works */}
      {mounted && createPortal(
        <div id="print-ticket" style={{ position: 'fixed', left: '-9999px', top: 0 }} aria-hidden="true">
          <TicketBody order={order} />
        </div>,
        document.body
      )}
    </>
  )
}
