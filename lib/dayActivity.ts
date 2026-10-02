// Pure: one day at the counter — what was dropped off and what was picked up — for the Today view
import type { Order } from './types'

type CounterOrder = Pick<Order, 'dropoffDate' | 'createdAt' | 'pickedUp' | 'pickedUpAt'>

/** The YYYY-MM-DD of a moment on this device's clock (the shop's iPad); '' if unreadable */
export function localDay(at: string | number | Date | undefined): string {
  if (at === undefined || at === '') return ''
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayISO(): string {
  return localDay(Date.now())
}

/** The day `n` days after (or before, when negative) a YYYY-MM-DD day */
export function shiftDay(day: string, n: number): string {
  const d = new Date(day + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return localDay(d)
}

/** "3:15 PM" */
export function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export interface DayActivity {
  dropoff: boolean    // dropped off that day
  dropoffAt?: string  // when, if the order was entered that same day
  pickup: boolean     // picked up that day (and not undone since)
  pickupAt?: string
  at: number          // the later of the two, to list the latest first
}

/** What happened to an order at the counter on `day`; null if nothing did */
export function dayActivity(order: CounterOrder, day: string): DayActivity | null {
  const dropoff = order.dropoffDate === day
  // An undone pickup keeps its old time but pickedUp is false, so it doesn't count
  const pickup = !!order.pickedUp && localDay(order.pickedUpAt) === day
  if (!dropoff && !pickup) return null
  const dropoffAt = dropoff && localDay(order.createdAt) === day ? order.createdAt : undefined
  const pickupAt = pickup ? order.pickedUpAt : undefined
  const at = Math.max(
    dropoff ? Date.parse(dropoffAt ?? day + 'T00:00:00') : 0,
    pickupAt ? Date.parse(pickupAt) : 0,
  )
  return { dropoff, ...(dropoffAt ? { dropoffAt } : {}), pickup, ...(pickupAt ? { pickupAt } : {}), at }
}

export interface DayCounts { dropoffs: number; pickups: number }

/** Drop-offs and pickups on every day that had any, for the calendar */
export function countsByDay(orders: CounterOrder[]): Record<string, DayCounts> {
  const days: Record<string, DayCounts> = {}
  for (const o of orders) {
    if (o.dropoffDate) (days[o.dropoffDate] ??= { dropoffs: 0, pickups: 0 }).dropoffs++
    const picked = o.pickedUp ? localDay(o.pickedUpAt) : ''
    if (picked) (days[picked] ??= { dropoffs: 0, pickups: 0 }).pickups++
  }
  return days
}
