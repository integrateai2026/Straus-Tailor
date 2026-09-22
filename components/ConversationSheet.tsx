'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SmsThread } from '@/lib/types'
import { formatPhone } from '@/lib/phone'
import MessageThread from './MessageThread'

type Theme = 'dark' | 'light'

interface Props {
  thread: SmsThread
  theme: Theme
  onClose: () => void
}

// Conversation with a number that has no orders (e.g. someone asking about hours)
export default function ConversationSheet({ thread, theme, onClose }: Props) {
  const light = theme === 'light'
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
    gsap.fromTo(panelRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' })
  }, [])

  function close() {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(panelRef.current, { y: 20, opacity: 0, duration: 0.2, ease: 'power2.in' })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.15 }, '-=0.05')
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      style={{ opacity: 0 }}
      onClick={(e) => { if (e.target === backdropRef.current) close() }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md h-[80vh] max-h-[680px] flex flex-col rounded-3xl border shadow-2xl p-5"
        style={{ opacity: 0, ...(light
          ? { background: '#F6F1E9', borderColor: 'rgba(0,0,0,0.10)' }
          : { background: '#141414', borderColor: '#2a2a2a' }) }}
      >
        <div className="flex items-start justify-between gap-3 pb-3 mb-1 border-b" style={{ borderColor: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)' }}>
          <div className="min-w-0">
            <p className={`text-base font-semibold truncate ${light ? 'text-[#1C1A18]' : 'text-white'}`}>
              {thread.customerName || formatPhone(thread.phone)}
            </p>
            <p className={`text-[11px] mt-0.5 ${light ? 'text-[#8A847C]' : 'text-[#555]'}`}>
              {thread.customerName ? formatPhone(thread.phone) : 'No orders with this number'}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className={`w-10 h-10 -mt-1 -mr-1 shrink-0 rounded-full flex items-center justify-center transition-colors ${light ? 'text-[#A89F94] hover:text-[#1C1A18]' : 'text-[#666] hover:text-white'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <MessageThread phone={thread.phone} customerName={thread.customerName} theme={theme} scrollable />
      </div>
    </div>
  )
}
