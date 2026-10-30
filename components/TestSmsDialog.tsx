'use client'

import { useState } from 'react'
import { Order } from '@/lib/types'

type Theme = 'dark' | 'light'

/**
 * Confirm step for the order page's Test SMS button: shows the number the order's first
 * text will go to, then sends it again. Nothing about the order changes.
 */
export default function TestSmsDialog({ order, theme, onClose, onSent }: {
  order: Order
  theme: Theme
  onClose: () => void
  onSent: () => void  // after a short "Sent ✓"
}) {
  const light = theme === 'light'
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  async function send() {
    setState('sending')
    setError('')
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}/confirmation`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Not sent. Please try again.')
      setState('sent')
      setTimeout(onSent, 700)
    } catch (err) {
      setState('idle')
      setError(err instanceof Error ? err.message : 'Not sent. Please try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && state === 'idle') onClose() }}
    >
      <div
        role="dialog"
        aria-label="Send a test text"
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
        style={light
          ? { background: '#F6F1E9', borderColor: 'rgba(0,0,0,0.10)' }
          : { background: '#141414', borderColor: '#2a2a2a' }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={light ? { background: 'rgba(14,165,233,0.12)' } : { background: 'rgba(14,165,233,0.15)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={light ? '#0369A1' : '#7dd3fc'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-base font-semibold" style={{ color: light ? '#1C1A18' : '#fff' }}>
              Send a test text?
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={state !== 'idle'}
            aria-label="Close"
            className="w-10 h-10 -mt-1 -mr-1 shrink-0 rounded-full flex items-center justify-center transition-colors"
            style={{ color: light ? '#8A847C' : '#999' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sm" style={{ color: light ? '#4A443C' : '#aaa' }}>
          The order’s first text goes again to:
        </p>
        <p className="text-2xl font-semibold mt-1 mb-5 tabular-nums" style={{ color: light ? '#1C1A18' : '#fff' }}>
          {order.phone}
        </p>

        {error && (
          <p className="text-sm mb-3" style={{ color: light ? '#B91C1C' : '#f87171' }}>{error}</p>
        )}

        <button
          onClick={send}
          disabled={state !== 'idle'}
          className="w-full h-12 rounded-xl text-sm font-semibold border transition-colors"
          style={light
            ? { background: '#0369A1', borderColor: '#0369A1', color: '#fff' }
            : { background: '#0284c7', borderColor: '#0284c7', color: '#fff' }}
        >
          {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent ✓' : 'Send test text'}
        </button>
      </div>
    </div>
  )
}
