'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { holidaysIn } from '@/lib/holidays'

interface Props {
  value: string                          // current date, YYYY-MM-DD ('' for none yet)
  title: string                          // small label over the full date, e.g. "Need by"
  counts: Record<string, number> | null  // numbers under the days; null while loading
  countUnit?: { one: string; other: string } // "Friday · 3 not ready" / "1 order"
  allowPast?: boolean                    // false: earlier days are greyed out and can't be picked
  palette?: 'paper' | 'dark'
  top?: React.ReactNode                  // extra controls under the full date (e.g. a switch)
  onSelect: (date: string) => void       // OK pressed with a date picked
  onClose: () => void                    // closed without changing anything
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// "paper" is the customer form's ivory look (also the dashboard's light mode); "dark" the dashboard's dark mode
const PALETTES = {
  paper: {
    panel: '#FDFAF5', border: 'transparent', shadow: '0 24px 64px rgba(0,0,0,0.35)',
    ink: '#1C1A18', muted: '#8A847C', label: '#9A9388', weekendLabel: '#BDB6AB', weekend: '#9A9388',
    past: '#D3CCC1', brass: '#8B7355', holiday: '#6B1A2C', divider: 'rgba(0,0,0,0.07)',
    selectedBg: '#1C1A18', selectedInk: '#FFFFFF', selectedDot: '#FDFAF5',
    cancel: '#4A443C', okBg: '#1C1A18', okInk: '#F6F1E9',
    hover: 'hover:bg-black/[0.04] active:bg-black/[0.07]',
    dayHover: 'hover:bg-black/[0.03] active:bg-black/[0.06]',
  },
  dark: {
    panel: '#161616', border: 'rgba(255,255,255,0.08)', shadow: '0 24px 64px rgba(0,0,0,0.6)',
    ink: '#F5F5F5', muted: '#8A8A8A', label: '#6E6E6E', weekendLabel: '#4F4F4F', weekend: '#9A9A9A',
    past: '#4A4A4A', brass: '#C4A882', holiday: '#F0899B', divider: 'rgba(255,255,255,0.07)',
    selectedBg: '#FFFFFF', selectedInk: '#000000', selectedDot: '#B4233C',
    cancel: '#BBBBBB', okBg: '#FFFFFF', okInk: '#000000',
    hover: 'hover:bg-white/[0.05] active:bg-white/[0.08]',
    dayHover: 'hover:bg-white/[0.04] active:bg-white/[0.07]',
  },
}

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
 * Our own calendar (the browser's date picker can't show anything extra): a number
 * under each day, big holidays marked, the picked date shown in full at the top.
 * Tapping a day picks it; OK confirms, Cancel / Esc / tapping outside changes nothing.
 */
export default function DateCalendar({
  value, title, counts, countUnit = { one: 'not ready', other: 'not ready' },
  allowPast = false, palette = 'paper', top, onSelect, onClose,
}: Props) {
  const p = PALETTES[palette]
  const [today] = useState(() => isoDate(new Date()))
  const [picked, setPicked] = useState(value)
  const [month, setMonth] = useState(() => {
    const d = new Date((value || today) + 'T00:00:00')
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
    gsap.fromTo(panelRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
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

  const unit = (n: number) => (n === 1 ? countUnit.one : countUnit.other)

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`
  const holidays = useMemo(() => holidaysIn(year), [year])
  const monthHolidays = Object.entries(holidays).filter(([d]) => d.startsWith(monthPrefix)).sort()
  const pickedHoliday = picked ? holidaysIn(Number(picked.slice(0, 4)))[picked] : undefined
  const pickedCount = picked && counts ? counts[picked] ?? 0 : 0

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array<null>(new Date(year, monthIndex, 1).getDay()).fill(null), // blanks before the 1st
    ...Array.from({ length: daysInMonth }, (_, i) => isoDate(new Date(year, monthIndex, i + 1))),
  ]
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const arrow = `w-12 h-12 rounded-full flex items-center justify-center transition-colors ${p.hover}`

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
        aria-label={`Choose the ${title.toLowerCase()}`}
        className="w-full max-w-[440px] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-[28px] border px-4 pt-3 pb-4 sm:px-6 sm:pt-5 sm:pb-5"
        style={{ opacity: 0, background: p.panel, borderColor: p.border, boxShadow: p.shadow }}
      >
        {/* The picked date in full — changes as days are tapped */}
        <div className="px-1 pt-2 pb-3 mb-2 border-b" style={{ borderColor: p.divider }}>
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: p.label }}>{title}</p>
          <p className="text-[24px] sm:text-[28px] font-semibold leading-tight mt-1" style={{ color: p.ink }}>
            {picked ? fullDate(picked) : 'Pick a date'}
          </p>
          <p className="text-[13px] mt-1 min-h-[18px]" style={{ color: p.muted }}>
            {picked && formatDate(picked, { weekday: 'long' })}
            {picked && counts !== null && (
              <> · <span className="font-bold" style={{ color: p.brass }}>{pickedCount}</span> {unit(pickedCount)}</>
            )}
            {pickedHoliday && <span className="font-semibold" style={{ color: p.holiday }}> · {pickedHoliday}</span>}
          </p>
          {top && <div className="mt-3">{top}</div>}
        </div>

        {/* Month */}
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous month" className={`${arrow} -ml-2`} style={{ color: p.muted }}
            onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <p className="text-[19px] font-semibold tracking-[0.01em]" style={{ color: p.ink }}>{monthLabel}</p>
          <button type="button" aria-label="Next month" className={`${arrow} -mr-2`} style={{ color: p.muted }}
            onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Weekday names */}
        <div className="grid grid-cols-7 mt-3 mb-1">
          {WEEKDAYS.map((d, i) => (
            <p key={d} className="text-center text-[11px] font-semibold tracking-[0.14em]"
              style={{ color: i === 0 || i === 6 ? p.weekendLabel : p.label }}>{d}</p>
          ))}
        </div>

        {/* Days — the whole cell is the tap target */}
        <div className="grid grid-cols-7">
          {cells.map((date, i) => {
            if (!date) return <div key={`blank-${i}`} />
            const blocked = !allowPast && date < today
            const selected = date === picked
            const holiday = holidays[date]
            const weekend = i % 7 === 0 || i % 7 === 6
            const count = blocked ? 0 : counts?.[date] ?? 0
            const color = selected ? p.selectedInk
              : blocked ? p.past
              : holiday ? p.holiday
              : weekend ? p.weekend
              : p.ink
            return (
              <button
                key={date}
                type="button"
                disabled={blocked}
                onClick={() => setPicked(date)}
                aria-pressed={selected}
                aria-label={[formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' }), holiday, count ? `${count} ${unit(count)}` : '']
                  .filter(Boolean).join(', ')}
                className={`h-16 flex flex-col items-center pt-1 rounded-2xl transition-colors ${blocked ? 'cursor-default' : p.dayHover}`}
              >
                <span
                  className="relative w-11 h-11 rounded-full flex items-center justify-center text-[18px] font-medium transition-colors"
                  style={{
                    color,
                    background: selected ? p.selectedBg : undefined,
                    boxShadow: date === today && !selected ? `inset 0 0 0 1.5px ${p.brass}` : undefined,
                  }}
                >
                  {Number(date.slice(8))}
                  {holiday && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: selected ? p.selectedDot : p.holiday }} />
                  )}
                </span>
                <span className="text-[11px] font-bold leading-none h-[11px] mt-0.5" style={{ color: p.brass }}>
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
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.holiday }} />
                <span className="font-semibold" style={{ color: p.holiday }}>{name}</span>
                <span style={{ color: p.muted }}>{formatDate(date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </p>
            ))}
          </div>
        )}

        {/* Cancel changes nothing; OK confirms the picked date */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t" style={{ borderColor: p.divider }}>
          <button type="button" onClick={() => close()}
            className={`h-12 px-4 rounded-full text-[15px] font-semibold transition-colors ${p.hover}`}
            style={{ color: p.cancel }}>
            Cancel
          </button>
          <button type="button" onClick={() => close(() => onSelect(picked))} disabled={!picked}
            className="h-12 px-7 rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-40"
            style={{ background: p.okBg, color: p.okInk, boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
