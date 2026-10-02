// Pure: an order's pickup history and the dated History list on the order page
import type { Order, OrderEvent, OrderStatus } from './types'

/** Pickup changes so far. Orders picked up before history was kept only have pickedUpAt. */
export function historyOf(order: Pick<Order, 'history' | 'pickedUpAt'>): OrderEvent[] {
  if (order.history?.length) return order.history
  return order.pickedUpAt ? [{ event: 'picked_up', at: order.pickedUpAt }] : []
}

/**
 * What to save when an order is marked picked up or un-marked. Un-marking sends the
 * order back to Active. Either way the change is added to its history with the time.
 */
export function pickupChange(
  order: Pick<Order, 'history' | 'pickedUpAt'>,
  pickedUp: boolean,
  now: string,
): { status: OrderStatus; pickedUpAt?: string; history: OrderEvent[] } {
  const history: OrderEvent[] = [...historyOf(order), { event: pickedUp ? 'picked_up' : 'pickup_undone', at: now }]
  return pickedUp
    ? { status: 'completed', pickedUpAt: now, history }
    : { status: 'active', history }
}

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
      : { label: 'Pickup undone — back to Active', at: e.at, tone: 'undo' }),
  ]

  return entries
    .filter(e => !Number.isNaN(Date.parse(e.at)))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}
