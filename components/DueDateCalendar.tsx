'use client'

import { useEffect, useState } from 'react'
import DateCalendar from './DateCalendar'

interface Props {
  value: string                    // current date, YYYY-MM-DD
  onSelect: (date: string) => void // OK pressed with a date picked
  onClose: () => void              // closed without changing anything
}

/**
 * Calendar for the customer form's Need By date. Under each day from today on: how
 * many orders are due that day and not ready yet, so staff can spread the work out.
 */
export default function DueDateCalendar({ value, onSelect, onClose }: Props) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null)

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

  return (
    <DateCalendar
      value={value}
      title="Need by"
      counts={counts}
      onSelect={onSelect}
      onClose={onClose}
    />
  )
}
