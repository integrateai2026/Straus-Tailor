'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { SmsThread } from '@/lib/types'
import { useMessages } from './MessagesProvider'
import { threadPreview, threadTitle } from './MessagesPanel'

type Theme = 'dark' | 'light'

interface Props {
  theme: Theme
  mutedPhone?: string                    // conversation already open on screen — no alert for it
  onView: (thread: SmsThread) => void
}

const SHOW_MS = 8000
const MAX_TOASTS = 3

function Toast({ thread, theme, onView, onDismiss }: {
  thread: SmsThread
  theme: Theme
  onView: () => void
  onDismiss: () => void
}) {
  const light = theme === 'light'
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.4)' })
  }, [])

  return (
    <div
      ref={ref}
      role="status"
      className="pointer-events-auto w-full max-w-sm rounded-2xl border shadow-2xl p-3.5 flex items-start gap-3"
      style={{ opacity: 0, ...(light
        ? { background: '#FDFAF5', borderColor: 'rgba(2,132,199,0.30)' }
        : { background: '#141414', borderColor: 'rgba(56,189,248,0.25)' }) }}
    >
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${light ? 'bg-sky-500/12 text-sky-700' : 'bg-sky-500/15 text-sky-300'}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${light ? 'text-sky-700' : 'text-sky-300'}`}>
          New text{thread.orderId ? ` · ${thread.orderId}` : ''}
        </p>
        <p className={`text-sm font-semibold truncate mt-0.5 ${light ? 'text-[#1C1A18]' : 'text-white'}`}>{threadTitle(thread)}</p>
        <p className={`text-[13px] mt-0.5 line-clamp-2 break-words ${light ? 'text-[#4A443C]' : 'text-[#aaa]'}`}>{threadPreview(thread)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className={`w-8 h-8 -mt-1 -mr-1 rounded-full flex items-center justify-center ${light ? 'text-[#A89F94] hover:text-[#1C1A18]' : 'text-[#555] hover:text-white'}`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          onClick={onView}
          className={`h-9 px-3.5 rounded-lg text-xs font-semibold ${light ? 'bg-[#1C1A18] text-[#F6F1E9]' : 'bg-white text-black'}`}
        >
          View
        </button>
      </div>
    </div>
  )
}

// Pop-up alerts on the staff dashboard when a customer texts in
export default function MessageToasts({ theme, mutedPhone, onView }: Props) {
  const { onArrival } = useMessages()
  const [toasts, setToasts] = useState<SmsThread[]>([])
  const mutedRef = useRef(mutedPhone)

  useEffect(() => { mutedRef.current = mutedPhone }, [mutedPhone])

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const unsubscribe = onArrival(arrivals => {
      const fresh = arrivals.filter(t => t.phone !== mutedRef.current)
      if (!fresh.length) return
      // Newest on top; a newer text from the same customer replaces their older alert
      setToasts(prev => [...fresh, ...prev.filter(p => !fresh.some(f => f.phone === p.phone))].slice(0, MAX_TOASTS))
      for (const t of fresh) {
        const timer = setTimeout(() => {
          timers.delete(timer)
          setToasts(prev => prev.filter(p => p !== t))
        }, SHOW_MS)
        timers.add(timer)
      }
    })
    return () => {
      unsubscribe()
      timers.forEach(clearTimeout)
    }
  }, [onArrival])

  const dismiss = (t: SmsThread) => setToasts(prev => prev.filter(p => p !== t))

  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map(t => (
        <Toast
          key={`${t.phone}-${t.lastAt}`}
          thread={t}
          theme={theme}
          onDismiss={() => dismiss(t)}
          onView={() => { dismiss(t); onView(t) }}
        />
      ))}
    </div>
  )
}
