'use client'

import { shiftDay, type DayCounts } from '@/lib/dayActivity'

type Theme = 'dark' | 'light'
export type DayShow = 'all' | 'dropoffs' | 'pickups'

// Drop-offs in brass, pickups in green — the same colors as the notes on the order rows
const TILES = {
  dark: {
    dropoffs: { number: 'text-[#C4A882]', on: 'bg-[#C4A882]/[0.12] border-[#C4A882]/45' },
    pickups:  { number: 'text-emerald-400', on: 'bg-emerald-500/[0.10] border-emerald-500/40' },
    off: 'bg-[#111] border-white/[0.06] hover:border-white/[0.14]',
    label: 'text-[#bbb]',
  },
  light: {
    dropoffs: { number: 'text-[#8B7355]', on: 'bg-[#8B7355]/[0.10] border-[#8B7355]/45' },
    pickups:  { number: 'text-emerald-700', on: 'bg-emerald-600/[0.08] border-emerald-600/40' },
    off: 'bg-[#FDFAF5] border-black/[0.08] hover:border-black/[0.18]',
    label: 'text-[#4A443C]',
  },
}

interface Props {
  day: string                   // the day shown, YYYY-MM-DD
  today: string
  counts: DayCounts
  show: DayShow
  theme: Theme
  onShow: (show: DayShow) => void
  onDay: (day: string) => void  // ‹ or ›
  onPickDay: () => void         // the date was tapped: choose any day
  onClose: () => void
}

/**
 * The Today view's bar: which day (‹ › a day at a time, or tap the date for any day) and
 * how many orders were dropped off and picked up. Tapping a number lists just those.
 */
export default function DayActivityBar({ day, today, counts, show, theme, onShow, onDay, onPickDay, onClose }: Props) {
  const light = theme === 'light'
  const t = TILES[theme]
  const relative = day === today ? 'Today' : day === shiftDay(today, -1) ? 'Yesterday' : ''
  const iconButton = `w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors disabled:opacity-25 disabled:pointer-events-none ${
    light ? 'text-[#6B6358] hover:bg-black/[0.05] hover:text-[#1C1A18]' : 'text-[#888] hover:bg-white/[0.05] hover:text-white'
  }`
  const tiles = [
    { key: 'dropoffs', count: counts.dropoffs, label: counts.dropoffs === 1 ? 'Drop-off' : 'Drop-offs' },
    { key: 'pickups',  count: counts.pickups,  label: counts.pickups === 1 ? 'Pickup' : 'Pickups' },
  ] as const

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onDay(shiftDay(day, -1))} aria-label="Previous day" title="Previous day" className={`${iconButton} -ml-1`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button
          type="button"
          onClick={onPickDay}
          className={`h-12 min-w-0 px-4 rounded-xl border text-sm font-semibold truncate transition-colors ${
            light ? 'bg-[#FDFAF5] border-black/[0.10] text-[#1C1A18] hover:border-black/[0.22]' : 'bg-[#111] border-white/[0.08] text-white hover:border-white/[0.16]'
          }`}
        >
          {relative && <>{relative} · </>}
          {new Date(day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          <span className="hidden sm:inline">, {day.slice(0, 4)}</span>
        </button>
        <button type="button" onClick={() => onDay(shiftDay(day, 1))} disabled={day >= today} aria-label="Next day" title="Next day" className={iconButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
        <button type="button" onClick={onClose} aria-label="Back to all orders" title="Back to all orders" className={`${iconButton} ml-auto`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tap a number to list just those; tap it again for both */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {tiles.map(({ key, count, label }) => {
          const on = show === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => onShow(on ? 'all' : key)}
              className={`h-16 rounded-2xl border flex items-center justify-center gap-2.5 transition-all ${on ? t[key].on : t.off} ${show !== 'all' && !on ? 'opacity-45' : ''}`}
            >
              <span className={`text-[28px] font-semibold leading-none tabular-nums ${t[key].number}`}>{count}</span>
              <span className={`text-[13px] font-semibold ${t.label}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
