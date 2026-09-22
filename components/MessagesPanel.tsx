'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SmsThread } from '@/lib/types'
import { formatPhone } from '@/lib/phone'
import { useMessages } from './MessagesProvider'

type Theme = 'dark' | 'light'

interface Props {
  theme: Theme
  onOpen: (thread: SmsThread) => void
  onClose: () => void
}

export function threadTitle(t: SmsThread): string {
  return t.customerName || formatPhone(t.phone)
}

export function threadPreview(t: SmsThread): string {
  const text = t.lastBody.replace(/\s+/g, ' ').trim() || (t.lastHasMedia ? 'Photo' : '')
  return t.lastDirection === 'outbound' ? `You: ${text}` : text
}

// "3:41 PM" today, "Yesterday", weekday this week, else "Sep 12"
function shortWhen(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const days = Math.floor((startOfToday - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000)
  if (days <= 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7)   return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
}

// Every number that has texted the shop, newest first — opened from the dashboard's Messages button
export default function MessagesPanel({ theme, onOpen, onClose }: Props) {
  const { threads } = useMessages()
  const light = theme === 'light'
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
    gsap.fromTo(panelRef.current, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
  }, [])

  function close(then: () => void = onClose) {
    const tl = gsap.timeline({ onComplete: then })
    tl.to(panelRef.current, { y: -8, opacity: 0, duration: 0.15, ease: 'power2.in' })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.12 }, '-=0.05')
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-[8vh]"
      style={{ opacity: 0 }}
      onClick={(e) => { if (e.target === backdropRef.current) close() }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ opacity: 0, ...(light
          ? { background: '#F6F1E9', borderColor: 'rgba(0,0,0,0.10)' }
          : { background: '#141414', borderColor: '#2a2a2a' }) }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${light ? 'border-black/[0.08]' : 'border-white/[0.06]'}`}>
          <div>
            <p className={`text-base font-semibold ${light ? 'text-[#1C1A18]' : 'text-white'}`}>Messages</p>
            <p className={`text-[11px] mt-0.5 ${light ? 'text-[#8A847C]' : 'text-[#555]'}`}>Texts customers send to the shop number</p>
          </div>
          <button
            onClick={() => close()}
            aria-label="Close"
            className={`w-10 h-10 -mr-2 rounded-full flex items-center justify-center transition-colors ${light ? 'text-[#A89F94] hover:text-[#1C1A18]' : 'text-[#666] hover:text-white'}`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Conversations */}
        <div className="overflow-y-auto">
          {threads.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className={`text-sm ${light ? 'text-[#6B6358]' : 'text-[#888]'}`}>No texts yet</p>
              <p className={`text-xs mt-1 ${light ? 'text-[#A89F94]' : 'text-[#555]'}`}>
                When a customer texts the shop, it shows up here and on their order.
              </p>
            </div>
          ) : threads.map(t => {
            const title = threadTitle(t)
            const isUnread = t.unread > 0
            return (
              <button
                key={t.phone}
                onClick={() => close(() => { onClose(); onOpen(t) })}
                className={`w-full text-left flex items-start gap-3 px-5 py-3.5 border-b last:border-0 transition-colors ${
                  light
                    ? `border-black/[0.06] ${isUnread ? 'bg-sky-500/[0.06] hover:bg-sky-500/[0.10]' : 'hover:bg-black/[0.03]'}`
                    : `border-white/[0.05] ${isUnread ? 'bg-sky-500/[0.06] hover:bg-sky-500/[0.10]' : 'hover:bg-white/[0.03]'}`
                }`}
              >
                {/* Avatar */}
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold ${
                  light ? 'bg-black/[0.06] text-[#4A443C]' : 'bg-white/[0.07] text-[#bbb]'
                }`}>
                  {t.customerName ? initials(t.customerName) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <p className={`text-sm truncate ${isUnread ? 'font-bold' : 'font-semibold'} ${light ? 'text-[#1C1A18]' : 'text-white'}`}>{title}</p>
                    {t.orderId && (
                      <span className={`text-[11px] font-mono font-semibold shrink-0 ${light ? 'text-[#8B7355]' : 'text-[#C4A882]'}`}>{t.orderId}</span>
                    )}
                    <span className={`ml-auto text-[11px] shrink-0 ${isUnread ? (light ? 'text-sky-700 font-semibold' : 'text-sky-300 font-semibold') : (light ? 'text-[#A89F94]' : 'text-[#555]')}`}>
                      {shortWhen(t.lastAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`text-[13px] truncate flex-1 ${isUnread ? (light ? 'text-[#1C1A18]' : 'text-[#ddd]') : (light ? 'text-[#6B6358]' : 'text-[#777]')}`}>
                      {threadPreview(t)}
                    </p>
                    {isUnread && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-sky-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
