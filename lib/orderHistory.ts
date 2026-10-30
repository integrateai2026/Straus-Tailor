// Pure: an order's pickup history and the dated History list on the order page
import type { Order, OrderEvent, OrderStatus } from './types'

/** Pickup changes so far. Orders picked up before history was kept only have pickedUpAt. */
export function historyOf(order: Pick<Order, 'history' | 'pickedUpAt'>): OrderEvent[] {
  if (order.history?.length) return order.history
  return order.pickedUpAt ? [{ event: 'picked_up', at: order.pickedUpAt }] : []
}

/**
 * What to save when an order is marked picked up or un-marked. Un-marking (usually an
 * accidental tap undone) puts the order back to the status it had just before — Ready stays
 * Ready, Active stays Active. Either way the change is added to its history with the time.
 */
export function pickupChange(
  order: Pick<Order, 'status' | 'history' | 'pickedUpAt' | 'notifiedAt'>,
  pickedUp: boolean,
  now: string,
): { status: OrderStatus; pickedUpAt?: string; history: OrderEvent[] } {
  const past = historyOf(order)
  if (pickedUp) {
    return { status: 'completed', pickedUpAt: now, history: [...past, { event: 'picked_up', at: now, from: order.status }] }
  }
  const back = statusBeforePickup(order, past)
  return { status: back, history: [...past, { event: 'pickup_undone', at: now, to: back }] }
}

// The status an order had just before its last pickup. Pickups saved before that was
// recorded: Ready if the customer had been told it was ready, otherwise Active.
function statusBeforePickup(order: Pick<Order, 'notifiedAt'>, past: OrderEvent[]): OrderStatus {
  const lastPickup = [...past].reverse().find(e => e.event === 'picked_up')
  if (lastPickup?.from) return lastPickup.from
  const notified = order.notifiedAt as unknown
  const timesNotified = Array.isArray(notified) ? notified.length : notified ? 1 : 0
  return timesNotified > 0 ? 'notified' : 'active'
}

const STATUS_NAME: Record<OrderStatus, string> = { active: 'Active', notified: 'Ready', completed: 'Completed' }

/**
 * When an order last had activity at the counter, in ms: dropped off (created) or a
 * pickup change (picked up, or a pickup undone). The All tab lists the most recent first.
 */
export function lastCounterActivity(order: Pick<Order, 'createdAt' | 'pickedUpAt' | 'history'>): number {
  let latest = Date.parse(order.createdAt) || 0
  if (order.pickedUpAt) latest = Math.max(latest, Date.parse(order.pickedUpAt) || 0)
  for (const e of order.history ?? []) latest = Math.max(latest, Date.parse(e.at) || 0)
  return latest
}

export type TimelineTone = 'neutral' | 'text' | 'pickup' | 'undo'

export interface TimelineEntry {
  label: string
  at: string
  tone: TimelineTone
}

/** Everything that has happened to an order, oldest first */
export function orderTimeline(
  order: Pick<Order, 'createdAt' | 'notifiedAt' | 'smsConsent' | 'history' | 'pickedUpAt'>,
): TimelineEntry[] {
  const notified: string[] = Array.isArray(order.notifiedAt)
    ? order.notifiedAt
    : order.notifiedAt ? [order.notifiedAt as unknown as string] : []

  const entries: TimelineEntry[] = [
    { label: 'Order created', at: order.createdAt, tone: 'neutral' },
    // Customers who agreed to texts get a Ready text; the others are called
    ...notified.map((at, i): TimelineEntry => ({
      label: order.smsConsent
        ? (notified.length > 1 ? `Ready text #${i + 1}` : 'Ready text sent')
        : 'Marked called',
      at,
      tone: 'text',
    })),
    ...historyOf(order).map((e): TimelineEntry => e.event === 'picked_up'
      ? { label: 'Picked up', at: e.at, tone: 'pickup' }
      // Undos saved before the status was recorded always went back to Active
      : { label: `Pickup undone — back to ${STATUS_NAME[e.to ?? 'active']}`, at: e.at, tone: 'undo' }),
  ]

  return entries
    .filter(e => !Number.isNaN(Date.parse(e.at)))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}
