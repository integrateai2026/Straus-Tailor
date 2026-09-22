'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SmsThread } from '@/lib/types'

const POLL_MS = 15000

type ArrivalListener = (threads: SmsThread[]) => void

interface MessagesContextValue {
  threads: SmsThread[]   // recent conversations, newest first
  unread: number         // unread customer texts across all conversations
  refresh: () => void
  // Subscribe to conversations that got a new customer text since the last check
  onArrival: (listener: ArrivalListener) => () => void
}

const MessagesContext = createContext<MessagesContextValue>({
  threads:   [],
  unread:    0,
  refresh:   () => {},
  onArrival: () => () => {},
})

export function useMessages() {
  return useContext(MessagesContext)
}

// Polls for customer texts while staff are signed in — drives the unread badges and new-text alerts
export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<SmsThread[]>([])
  const [unread, setUnread]   = useState(0)
  const loadRef      = useRef<() => void>(() => {})
  const listenersRef = useRef(new Set<ArrivalListener>())

  useEffect(() => {
    let seq = 0                                // ignore out-of-order responses from overlapping fetches
    let lastText = ''                          // skip re-renders when nothing changed
    let seen: Map<string, number> | null = null // phone → newest text time already seen; null until first load

    async function load() {
      // Skip background polls while hidden — but never the first load
      if (document.hidden && seen) return
      const mySeq = ++seq
      try {
        const res = await fetch('/api/messages/threads')
        if (mySeq !== seq || !res.ok) return
        const text = await res.text()
        if (mySeq !== seq || text === lastText) return
        const data = JSON.parse(text) as { unread: number; threads: SmsThread[] }
        if (!Array.isArray(data.threads)) return
        lastText = text

        // Texts that arrived since the last check. On the first load they're just unread, not "new".
        const before = seen
        const arrivals = before
          ? data.threads.filter(t =>
              t.lastDirection === 'inbound' && t.unread > 0 &&
              Date.parse(t.lastAt) > (before.get(t.phone) ?? 0))
          : []
        seen = new Map(data.threads.map(t => [t.phone, Date.parse(t.lastAt)]))

        setThreads(data.threads)
        setUnread(data.unread)
        if (arrivals.length) listenersRef.current.forEach(fn => fn(arrivals))
      } catch {
        // network hiccup or malformed response — keep current data; next poll retries
      }
    }

    loadRef.current = load
    load()
    const interval = setInterval(load, POLL_MS)
    const onVisible = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      seq++
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Unread count in the browser tab title, e.g. "(2) Straus Tailor Shop — Staff"
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\) /, '')
    document.title = unread > 0 ? `(${unread}) ${base}` : base
  }, [unread])

  const refresh = useCallback(() => loadRef.current(), [])

  const onArrival = useCallback((listener: ArrivalListener) => {
    listenersRef.current.add(listener)
    return () => { listenersRef.current.delete(listener) }
  }, [])

  const value = useMemo(
    () => ({ threads, unread, refresh, onArrival }),
    [threads, unread, refresh, onArrival]
  )

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
}
