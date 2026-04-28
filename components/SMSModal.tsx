'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Order } from '@/lib/types'

interface Props {
  order: Order
  onClose: () => void
  onSent: (updated: Order) => void
}

export default function SMSModal({ order, onClose, onSent }: Props) {
  const defaultMsg = `Hi ${order.customerName.split(' ')[0]}, your order ${order.id} is ready for pickup. Thank you!\n— Straus Tailor Shop`
  const [message, setMessage] = useState(defaultMsg)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    gsap.fromTo(panelRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' })
  }, [])

  function close() {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(panelRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.15 }, '-=0.05')
  }

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, phone: order.phone, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSent(true)
      setTimeout(() => {
        onSent(data.order)
        close()
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      style={{ opacity: 0 }}
      onClick={(e) => e.target === backdropRef.current && close()}
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm bg-[#141414] border border-[#2a2a2a] rounded-3xl p-6 shadow-2xl"
        style={{ opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1e1e1e] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Send SMS</p>
              <p className="text-[11px] text-[#555]">Notify customer</p>
            </div>
          </div>
          <button onClick={close} className="w-7 h-7 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[#555] hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* To field */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1.5">To</p>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
            <p className="text-sm text-white">{order.phone}</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1.5">Message</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={160}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444] outline-none focus:border-[#444] transition-colors resize-none leading-relaxed"
          />
          <p className="text-[10px] text-[#444] text-right mt-1">{message.length}/160</p>
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <button
          onClick={handleSend}
          disabled={sending || sent || !message.trim()}
          className="w-full h-12 rounded-xl bg-white text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sent ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Sent!
            </>
          ) : sending ? (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send SMS
            </>
          )}
        </button>
      </div>
    </div>
  )
}
