'use client'

import { useMemo, useState } from 'react'
import { Order } from '@/lib/types'
import DateCalendar from './DateCalendar'

type Theme = 'dark' | 'light'
export type DateMode = 'due' | 'dropoff'

export const DATE_MODES: Record<DateMode, { label: string; title: string; verb: string }> = {
  due:     { label: 'Due',      title: 'Due date',      verb: 'due' },
  dropoff: { label: 'Drop-off', title: 'Drop-off date', verb: 'dropped off' },
}

export function orderDate(order: Order, mode: DateMode): string {
  return mode === 'due' ? order.dueDate : order.dropoffDate
}

// Due / Drop-off switch
export function DateModeSwitch({ mode, onChange, theme }: {
  mode: DateMode
  onChange: (mode: DateMode) => void
  theme: Theme
}) {
  const light = theme === 'light'
  return (
    <div role="radiogroup" aria-label="Show orders by"
      className={`inline-flex p-1 rounded-xl border ${light ? 'bg-black/[0.03] border-black/[0.08]' : 'bg-white/[0.03] border-white/[0.08]'}`}>
      {(Object.keys(DATE_MODES) as DateMode[]).map(m => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={`h-10 px-4 rounded-lg text-xs font-semibold transition-all ${
            mode === m
              ? (light ? 'bg-[#1C1A18] text-[#F6F1E9]' : 'bg-white text-black')
              : (light ? 'text-[#8A847C] hover:text-[#4A443C]' : 'text-[#777] hover:text-[#bbb]')
          }`}
        >
          {DATE_MODES[m].label}
        </button>
      ))}
    </div>
  )
}

/**
 * Calendar for choosing which day's orders to show. The switch chooses due date or
 * drop-off date; the number under each day is how many orders that would show.
 */
export default function OrderDatePicker({ orders, mode, date, theme, onApply, onClose }: {
  orders: Order[]  // orders in the current tab and search, before the date filter
  mode: DateMode
  date: string
  theme: Theme
  onApply: (mode: DateMode, date: string) => void
  onClose: () => void
}) {
  const [pendingMode, setPendingMode] = useState(mode)

  const counts = useMemo(() => {
    const byDay: Record<string, number> = {}
    for (const o of orders) {
      const day = orderDate(o, pendingMode)
      if (day) byDay[day] = (byDay[day] ?? 0) + 1
    }
    return byDay
  }, [orders, pendingMode])

  return (
    <DateCalendar
      value={date}
      title={DATE_MODES[pendingMode].title}
      counts={counts}
      countUnit={{ one: 'order', other: 'orders' }}
      allowPast
      palette={theme === 'light' ? 'paper' : 'dark'}
      top={<DateModeSwitch mode={pendingMode} onChange={setPendingMode} theme={theme} />}
      onSelect={day => onApply(pendingMode, day)}
      onClose={onClose}
    />
  )
}
