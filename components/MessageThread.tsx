'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { SmsMessage } from '@/lib/types'
import { optKeyword } from '@/lib/smsRules'
import { useMessages } from './MessagesProvider'

type Theme = 'dark' | 'light'

interface Props {
  phone: string            // customer's number, digits only
  orderId?: string         // texts sent from here are filed under this order
  customerName?: string
  theme?: Theme
  reloadKey?: number       // bump to reload after a text is sent elsewhere (e.g. the Ready SMS)
  fillHeight?: boolean     // in a fixed-height sheet: the texts fill the space above the composer
}

interface ThreadData {
  messages: SmsMessage[]
  optedOut: boolean
  canText: boolean
}

const MAX_LENGTH = 1600  // Twilio's limit for a single text

const STYLES = {
  dark: {
    card:     'bg-white/[0.03] border-white/[0.06]',
    muted:    'text-[#666]',
    faint:    'text-[#555]',
    inbound:  'bg-white/[0.07] text-white border border-white/[0.06]',
    outbound: 'bg-sky-500/15 text-sky-50 border border-sky-500/25',
    tag:      'text-sky-300/70',
    input:    'bg-white/[0.06] border-white/[0.12] text-white placeholder-[#555] focus:border-white/[0.3]',
    send:     'bg-white text-black',
    note:     'bg-white/[0.04] border-white/[0.08] text-[#888]',
    warn:     'bg-amber-500/10 border-amber-500/25 text-amber-300',
    error:    'text-red-400',
    link:     'text-[#aaa] hover:text-white',
  },
  light: {
    card:     'bg-black/[0.03] border-black/[0.08]',
    muted:    'text-[#8A847C]',
    faint:    'text-[#A89F94]',
    inbound:  'bg-[#FDFAF5] text-[#1C1A18] border border-black/[0.08]',
    outbound: 'bg-sky-500/12 text-sky-950 border border-sky-600/25',
    tag:      'text-sky-700/80',
    input:    'bg-black/[0.04] border-black/[0.12] text-[#1C1A18] placeholder-[#A89F94] focus:border-black/[0.35]',
    send:     'bg-[#1C1A18] text-[#F6F1E9]',
    note:     'bg-black/[0.03] border-black/[0.08] text-[#6B6358]',
    warn:     'bg-amber-500/15 border-amber-600/30 text-amber-800',
    error:    'text-red-700',
    link:     'text-[#6B6358] hover:text-[#1C1A18]',
  },
}

// GSM-7 is the plain-text SMS alphabet; anything outside it (emoji, curly quotes)
// switches the whole text to UCS-2, which fits far fewer characters per text.
const GSM_CHARS = /^[\n\r @£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/
const GSM_EXTENDED = /[\^{}\\[~\]|€]/g

/** How many texts (segments) the carrier splits a message into — each is billed separately */
function segmentCount(text: string): number {
  if (!text) return 0
  const gsm = GSM_CHARS.test(text)
  const units = gsm ? text.length + (text.match(GSM_EXTENDED)?.length ?? 0) : text.length
  const [single, multi] = gsm ? [160, 153] : [70, 67]
  return units <= single ? 1 : Math.ceil(units / multi)
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString()
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  })
}

function Spinner({ size = 15 }: { size?: number }) {
  return (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// A texted photo, or a plain link if it can't be shown (e.g. Twilio no longer has it)
function MediaImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-2">
        Photo (couldn&apos;t load)
      </a>
    )
  }
  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element -- auth-protected proxy URL; next/image can't fetch it */}
      <img
        src={src}
        alt="Photo from customer"
        loading="lazy"
        onError={() => setFailed(true)}
        className="block max-w-[220px] max-h-[260px] rounded-lg object-cover"
      />
    </a>
  )
}

function Bubble({ message, currentOrderId, theme }: { message: SmsMessage; currentOrderId?: string; theme: Theme }) {
  const s = STYLES[theme]
  const outbound = message.direction === 'outbound'
  const keyword = outbound ? null : optKeyword(message.body)
  const otherOrder = message.orderId && currentOrderId && message.orderId !== currentOrderId

  return (
    <div className={`flex flex-col ${outbound ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${outbound ? `${s.outbound} rounded-br-md` : `${s.inbound} rounded-bl-md`}`}>
        {message.media.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1.5 last:mb-0">
            {message.media.map((m, i) => {
              const src = `/api/messages/${message.id}/media/${i}`
              return m.contentType.startsWith('image/') ? (
                <MediaImage key={i} src={src} />
              ) : (
                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-2">
                  Attachment ({m.contentType.split('/')[1] ?? 'file'})
                </a>
              )
            })}
          </div>
        )}
        {message.body && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>
        )}
      </div>
      <p className={`text-[10px] mt-1 px-1 ${s.faint}`}>
        {formatTime(message.createdAt)}
        {keyword === 'out' && ' · Opted out of texts'}
        {keyword === 'in' && ' · Opted back in'}
        {otherOrder && <span className={s.tag}> · about {message.orderId}</span>}
      </p>
    </div>
  )
}

export default function MessageThread({ phone, orderId, customerName, theme = 'dark', reloadKey = 0, fillHeight = false }: Props) {
  const s = STYLES[theme]
  const light = theme === 'light'
  const name = customerName?.trim().split(/\s+/)[0] || 'this customer'

  const { threads, refresh } = useMessages()
  // Changes whenever the background check sees a new text in this conversation
  const activity = threads.find(t => t.phone === phone)?.lastAt

  const [data, setData]       = useState<ThreadData | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [retryKey, setRetryKey]   = useState(0)
  const [draft, setDraft]     = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const listRef    = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const stickRef   = useRef(true) // keep the newest text in view, unless staff scrolled up to read older ones
  const hasUnreadRef = useRef(false)

  // Clear this conversation's unread badge — only while staff can actually see the page
  const markRead = useCallback(async () => {
    if (document.hidden || !hasUnreadRef.current) return
    hasUnreadRef.current = false
    try {
      const res = await fetch('/api/messages/read', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error()
      refresh()
    } catch {
      hasUnreadRef.current = true // try again next time
    }
  }, [phone, refresh])

  // Load the conversation — again whenever the background check sees new activity in it
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/messages?phone=${encodeURIComponent(phone)}`)
        if (!res.ok) throw new Error()
        const next: ThreadData = await res.json()
        if (cancelled) return
        setData(next)
        setLoadError(false)
        hasUnreadRef.current = next.messages.some(m => m.direction === 'inbound' && !m.readAt)
        markRead()
      } catch {
        if (!cancelled) setLoadError(true)
      }
    }
    load()
    return () => { cancelled = true }
  }, [phone, activity, reloadKey, retryKey, markRead])

  // Texts that arrived while the tab was in the background count as read once staff come back
  useEffect(() => {
    const onVisible = () => { if (!document.hidden) markRead() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [markRead])

  // Scroll to the newest text whenever the conversation grows (new texts, a photo
  // finishing loading) — but only if staff are already at the bottom
  useEffect(() => {
    const list = listRef.current
    const content = contentRef.current
    if (!list || !content) return
    const observer = new ResizeObserver(() => {
      if (stickRef.current) list.scrollTop = list.scrollHeight
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  // A different customer's conversation starts at its newest text
  useEffect(() => { stickRef.current = true }, [phone])

  function onListScroll() {
    const el = listRef.current
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40
  }

  async function send() {
    const body = draft.trim()
    if (!body || sending) return
    setSending(true)
    setSendError('')
    try {
      const res = await fetch('/api/messages', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, orderId, body }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || 'Failed to send')
      setDraft('')
      stickRef.current = true // show the text just sent
      if (result.message) {
        setData(d => d && { ...d, messages: [...d.messages, result.message] })
      } else {
        setRetryKey(k => k + 1) // sent, but not echoed back — reload the conversation
      }
      refresh()
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  const messages = data?.messages ?? []
  const segments = segmentCount(draft)

  return (
    <div className={`flex flex-col ${fillHeight ? 'flex-1 min-h-0' : ''}`}>
      {/* Conversation — scrolls inside its own box so a long history doesn't stretch the page */}
      <div
        ref={listRef}
        onScroll={onListScroll}
        className={fillHeight
          ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain px-1 py-2'
          : `max-h-[min(360px,55vh)] overflow-y-auto overscroll-contain rounded-xl border px-3 py-3 ${s.card}`}
      >
        <div ref={contentRef}>
          {!data && !loadError && (
            <div className={`flex justify-center py-6 ${s.faint}`}><Spinner size={18} /></div>
          )}

          {!data && loadError && (
            <div className="flex flex-col items-center gap-2 py-5">
              <p className={`text-sm ${s.muted}`}>Couldn&apos;t load texts.</p>
              <button onClick={() => setRetryKey(k => k + 1)} className={`text-xs font-semibold h-10 px-3 ${s.link}`}>
                Try again
              </button>
            </div>
          )}

          {data && messages.length === 0 && (
            <p className={`text-sm italic text-center py-4 ${s.faint}`}>No texts with {name} yet</p>
          )}

          {data && messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <Fragment key={m.id}>
                  {(i === 0 || dayKey(messages[i - 1].createdAt) !== dayKey(m.createdAt)) && (
                    <p className={`text-[10px] uppercase tracking-widest text-center pt-1 ${s.faint}`}>{dayLabel(m.createdAt)}</p>
                  )}
                  <Bubble message={m} currentOrderId={orderId} theme={theme} />
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      {data && (
        <div className={fillHeight ? 'pt-3' : 'mt-3'}>
          {data.optedOut ? (
            <p className={`text-xs leading-relaxed rounded-xl border px-3.5 py-2.5 ${s.warn}`}>
              Texts are blocked — {name} texted STOP. They can text START to opt back in.
            </p>
          ) : !data.canText ? (
            <p className={`text-xs leading-relaxed rounded-xl border px-3.5 py-2.5 ${s.note}`}>
              No SMS consent on file — you can reply here once {name} texts the shop.
            </p>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={e => { setDraft(e.target.value); if (sendError) setSendError('') }}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send() } }}
                  rows={2}
                  maxLength={MAX_LENGTH}
                  placeholder={`Text ${name}…`}
                  aria-label={`Text ${name}`}
                  className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors resize-none leading-relaxed ${s.input}`}
                />
                <button
                  onClick={send}
                  disabled={!draft.trim() || sending}
                  aria-label="Send text"
                  className={`h-11 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${s.send}`}
                >
                  {sending ? <Spinner /> : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                  Send
                </button>
              </div>
              <div className="flex justify-between gap-3 mt-1 min-h-[16px]">
                <p className={`text-xs ${s.error}`}>{sendError}</p>
                {segments > 1 && (
                  <p className={`text-[10px] shrink-0 ${light ? 'text-[#A89F94]' : 'text-[#555]'}`}>
                    Sends as {segments} texts
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
