'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { holidaysIn } from '@/lib/holidays'

interface Props {
  value: string                    // current date, YYYY-MM-DD
  onSelect: (date: string) => void // OK pressed with a date picked
  onClose: () => void              // closed without changing anything
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Form palette
const INK      = '#1C1A18'
const MUTED    = '#8A847C'
const BRASS    = '#8B7355'
const BURGUNDY = '#6B1A2C'

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(date: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', opts)
}

// 1st, 2nd, 3rd, 4th … 11th, 12th, 13th … 21st
function ordinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`
}

// "October 9th, 2026"
function fullDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return `${d.toLocaleDateString('en-US', { month: 'long' })} ${ordinal(d.getDate())}, ${d.getFullYear()}`
}

/**
 * Calendar for the Need By date. Under each day from today on: how many orders are
 * due that day and not ready yet, so staff can spread the work out. Big holidays are
 * marked. Tapping a day picks it; OK saves, Cancel leaves the date as it was.
 * It replaces the browser's own date picker, which can't show anything extra.
 */
export default function DueDateCalendar({ value, onSelect, onClose }: Props) {
  const [today] = useState(() => isoDate(new Date()))
  const [picked, setPicked] = useState(value)
  const [month, setMonth] = useState(() => {
    const d = new Date((value || today) + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
    gsap.fromTo(panelRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
  }, [])

  // Fresh counts each time the calendar opens; it works fine without them
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/orders/due-counts')
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.counts) setCounts(data.counts)
      } catch { /* network hiccup — show the calendar without numbers */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Esc cancels on a keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function close(then: () => void = onClose) {
    const tl = gsap.timeline({ onComplete: then })
    tl.to(panelRef.current, { y: 10, opacity: 0, duration: 0.15, ease: 'power2.in' })
    tl.to(backdropRef.current, { opacity: 0, duration: 0.12 }, '-=0.05')
  }

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  const holidays = useMemo(() => holidaysIn(year), [year])
  const monthHolidays = Object.entries(holidays).filter(([d]) => d.startsWith(monthPrefix)).sort()
  const pickedHoliday = picked ? holidaysIn(Number(picked.slice(0, 4)))[picked] : undefined

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array<null>(new Date(year, monthIndex, 1).getDay()).fill(null), // blanks before the 1st
    ...Array.from({ length: daysInMonth }, (_, i) => isoDate(new Date(year, monthIndex, i + 1))),
  ]
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const arrow = 'w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-black/[0.04] active:bg-black/[0.07]'

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      style={{ opacity: 0 }}
      onClick={(e) => { if (e.target === backdropRef.current) close() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Choose the Need By date"
        className="w-full max-w-[440px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-[28px] px-4 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-5"
        style={{ opacity: 0, background: '#FDFAF5', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
      >
        {/* The picked date in full — changes as days are tapped */}
        <div className="px-1 pt-2 pb-3 mb-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: '#9A9388' }}>Need by</p>
          <p className="text-[24px] sm:text-[28px] font-semibold leading-tight mt-1" style={{ color: INK }}>
            {picked ? fullDate(picked) : 'Pick a date'}
          </p>
          <p className="text-[13px] mt-1 min-h-[18px]" style={{ color: MUTED }}>
            {picked && formatDate(picked, { weekday: 'long' })}
            {picked && counts !== null && (
              <> · <span className="font-bold" style={{ color: BRASS }}>{counts[picked] ?? 0}</span> not ready</>
            )}
            {pickedHoliday && <span className="font-semibold" style={{ color: BURGUNDY }}> · {pickedHoliday}</span>}
          </p>
        </div>

        {/* Month */}
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous month" className={`${arrow} -ml-2`} style={{ color: MUTED }}
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <p className="text-[19px] font-semibold tracking-[0.01em]" style={{ color: INK }}>{monthLabel}</p>
          <button type="button" aria-label="Next month" className={`${arrow} -mr-2`} style={{ color: MUTED }}
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Weekday names */}
        <div className="grid grid-cols-7 mt-3 mb-1">
          {WEEKDAYS.map((d, i) => (
            <p key={d} className="text-center text-[11px] font-semibold tracking-[0.14em]"
              style={{ color: i === 0 || i === 6 ? '#BDB6AB' : '#9A9388' }}>{d}</p>
          ))}
        </div>

        {/* Days — the whole cell is the tap target */}
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={`blank-${i}`} />
            const past = date < today
            const selected = date === picked
            const holiday = holidays[date]
            const weekend = i % 7 === 0 || i % 7 === 6
            const count = past ? 0 : counts?.[date] ?? 0
            const color = selected ? '#FFFFFF'
              : past ? '#D3CCC1'
              : holiday ? BURGUNDY
              : weekend ? '#9A9388'
              : INK
            return (
              <button
                key={date}
                type="button"
                disabled={past}
                onClick={() => setPicked(date)}
                aria-pressed={selected}
                aria-label={[formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' }), holiday, count ? `${count} not ready` : '']
                  .filter(Boolean).join(', ')}
                className={`h-16 flex flex-col items-center pt-1 rounded-2xl transition-colors ${past ? 'cursor-default' : 'hover:bg-black/[0.03] active:bg-black/[0.06]'}`}
              >
                <span
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-medium transition-colors"
                  style={{
                    color,
                    background: selected ? INK : undefined,
                    boxShadow: date === today && !selected ? `inset 0 0 0 1.5px ${BRASS}` : undefined,
                  }}
                >
                  {Number(date.slice(8))}
                  {holiday && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: selected ? '#FDFAF5' : BURGUNDY }} />
                  )}
                </span>
                <span className="text-[11px] font-bold leading-none h-[11px] mt-0.5" style={{ color: BRASS }}>
                  {count > 0 ? count : ''}
                </span>
              </button>
            )
          })}
        </div>

        {/* This month's holidays */}
        {monthHolidays.length > 0 && (
          <div className="mt-2 space-y-1">
            {monthHolidays.map(([date, name]) => (
              <p key={date} className="flex items-center gap-2 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BURGUNDY }} />
                <span className="font-semibold" style={{ color: BURGUNDY }}>{name}</span>
                <span style={{ color: MUTED }}>{formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </p>
            ))}
          </div>
        )}

        {/* Cancel keeps the old date; OK saves the picked one */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
          <button type="button" onClick={() => close()}
            className="h-12 px-4 rounded-full text-[15px] font-semibold transition-colors hover:bg-black/[0.04] active:bg-black/[0.07]"
            style={{ color: '#4A443C' }}>
            Cancel
          </button>
          <button type="button" onClick={() => close(() => onSelect(picked))} disabled={!picked}
            className="h-12 px-7 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-40"
            style={{ background: INK, color: '#F6F1E9', boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
