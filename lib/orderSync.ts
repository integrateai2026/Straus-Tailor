// Pure: keeping the dashboard's copy of the orders current from the lighter refresh
import type { Order, OrderChanges } from './types'

// Newest first, like the server's full list (orders made at the same moment keep their order)
function newestFirst(a: Order, b: Order): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/**
 * Apply one refresh to the current list: a full one replaces it, otherwise changed orders
 * are swapped in and new ones added. Returns the very same array when nothing really
 * changed (changes are re-sent for a minute), so the screen doesn't redraw for nothing.
 */
export function applyOrderChanges(current: Order[], changes: Pick<OrderChanges, 'full' | 'orders'>): Order[] {
  const incoming = new Map(changes.orders.map(o => [o.id, o]))
  if (changes.full) {
    const next = [...incoming.values()].sort(newestFirst)
    return same(current, next) ? current : next
  }
  let changed = false
  const merged = current.map(o => {
    const update = incoming.get(o.id)
    if (!update) return o
    incoming.delete(o.id)
    if (same(o, update)) return o
    changed = true
    return update
  })
  if (incoming.size > 0) {
    merged.push(...incoming.values()) // orders this device hasn't seen yet
    changed = true
  }
  return changed ? merged.sort(newestFirst) : current
}
