'use client'

import { useMemo, useState } from 'react'
import { Order } from '@/lib/types'
import { dropoffsByDay, notReadyByDueDate } from '@/lib/dayActivity'
import DateCalendar from './DateCalendar'

type Theme = 'dark' | 'light'
export type DateMode = 'due' | 'dropoff'

// unit: what the number under each day counts. tab: where picking a day shows exactly those orders.
export const DATE_MODES: Record<DateMode, { label: string; title: string; verb: string; unit: string; tab: 'active' | 'all' }> = {
  due:     { label: 'Due',      title: 'Due date',      verb: 'due',         unit: 'not ready',   tab: 'active' },
  dropoff: { label: 'Drop-off', title: 'Drop-off date', verb: 'dropped off', unit: 'dropped off', tab: 'all' },
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
              : (light ? 'text-[#8A847C] hover:text-[#4A443C]' : 'text-[#A3A3A3] hover:text-white')
          }`}
        >
          {DATE_MODES[m].label}
        </button>
      ))}
    </div>
  )
}

/**
 * Calendar for choosing which day's orders to show. Under each day: on the Due side, how
 * many orders due that day aren't ready yet; on the Drop-off side, how many were dropped
 * off. The numbers are the same on every tab.
 */
export default function OrderDatePicker({ orders, mode, date, theme, onApply, onClose }: {
  orders: Order[]  // every order
  mode: DateMode
  date: string
  theme: Theme
  onApply: (mode: DateMode, date: string) => void
  onClose: () => void
}) {
  const [pendingMode, setPendingMode] = useState(mode)

  const counts = useMemo(
    () => (pendingMode === 'due' ? notReadyByDueDate(orders) : dropoffsByDay(orders)),
    [orders, pendingMode],
  )
  const unit = DATE_MODES[pendingMode].unit

  return (
    <DateCalendar
      value={date}
      title={DATE_MODES[pendingMode].title}
      counts={counts}
      countUnit={{ one: unit, other: unit }}
      allowPast
      palette={theme === 'light' ? 'paper' : 'dark'}
      top={<DateModeSwitch mode={pendingMode} onChange={setPendingMode} theme={theme} />}
      onSelect={day => onApply(pendingMode, day)}
      onClose={onClose}
    />
  )
}
