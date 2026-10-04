import { supabase } from './supabase'
import { Order, OrderChanges, OrderEvent, CreateOrderInput, UpdateOrderInput } from './types'

// Map Supabase snake_case row → camelCase Order
function toOrder(row: Record<string, unknown>): Order {
  return {
    id:           row.id           as string,
    orderNumber:  row.order_number as number,
    customerName: row.customer_name as string,
    phone:        row.phone        as string,
    dropoffDate:  row.dropoff_date as string,
    dueDate:      row.due_date     as string,
    notes:        row.notes        as string,
    status:       row.status       as Order['status'],
    paid:         row.paid         as boolean,
    pickedUp:     row.picked_up    as boolean,
    createdAt:    row.created_at   as string,
    ...(row.notified_at  ? { notifiedAt:  row.notified_at  as string[] } : {}),
    ...(row.picked_up_at ? { pickedUpAt:  row.picked_up_at as string   } : {}),
    ...(row.completed_at ? { completedAt: row.completed_at as string   } : {}),
    ...(row.total_amount != null ? { totalAmount:  row.total_amount  as number } : {}),
    ...(row.item_count   != null ? { itemCount:    row.item_count    as number } : {}),
    ...(row.sms_consent  != null ? { smsConsent:   row.sms_consent   as boolean } : {}),
    ...(row.garments     != null ? { garments:     row.garments      as Record<string, number> } : {}),
    ...(row.alterations  != null ? { alterations:  row.alterations   as string[] } : {}),
    ...(row.history      != null ? { history:      row.history       as OrderEvent[] } : {}),
    ...(row.tailors      != null ? { tailors:      row.tailors       as string[] } : {}),
  }
}

// Next order number: sequential from #10001, skipping any number an older
// (randomly numbered) order already has — see public.next_order_number()
async function nextOrderNumber(): Promise<number> {
  const { data, error } = await supabase.rpc('next_order_number')
  if (error || typeof data !== 'number') {
    throw new Error(error?.message ?? 'Could not get the next order number')
  }
  return data
}

export async function getAllOrders(status?: string, query?: string): Promise<Order[]> {
  // Supabase caps a single response at 1000 rows — page through so no order is ever silently dropped
  const PAGE = 1000
  const rows: Record<string, unknown>[] = []
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from('orders').select('*')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (status && status !== 'all') q = q.eq('status', status)
    if (query) {
      q = q.or(
        `customer_name.ilike.%${query}%,phone.ilike.%${query}%,id.ilike.%${query}%`
      )
    }
    const { data, error } = await q
    if (error) throw new Error(error.message)
    rows.push(...(data ?? []))
    if (!data || data.length < PAGE) break
  }
  return rows.map(toOrder)
}

// Changes made up to a minute before the cursor are re-sent, so one that lands a moment
// late is never missed. The dashboard merges by order id, so repeats are harmless.
const CHANGES_OVERLAP_MS = 60_000

/**
 * The staff dashboard's refresh: only the orders changed since `since` (the cursor it got
 * back last time) instead of every order. No cursor, or an unreadable one: every order.
 */
export async function getOrderChanges(since: string | null): Promise<OrderChanges> {
  const cursor = new Date().toISOString() // taken before reading, so nothing slips between
  const sinceMs = since ? Date.parse(since) : NaN
  if (!Number.isNaN(sinceMs)) {
    const [changed, all] = await Promise.all([
      supabase.from('orders').select('*')
        .gt('updated_at', new Date(sinceMs - CHANGES_OVERLAP_MS).toISOString())
        .order('updated_at')
        .limit(1000),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ])
    if (changed.error) throw new Error(changed.error.message)
    if (all.error) throw new Error(all.error.message)
    // 1000+ changes at once (a bulk import): simpler and safer to send everything
    if ((changed.data ?? []).length < 1000) {
      return { full: false, orders: (changed.data ?? []).map(toOrder), cursor, total: all.count ?? 0 }
    }
  }
  // A row read twice while paging (an order added mid-read) counts once
  const orders = [...new Map((await getAllOrders()).map(o => [o.id, o])).values()]
  return { full: true, orders, cursor, total: orders.length }
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  return data ? toOrder(data) : undefined
}

// Most recent customer name on record for a phone number (digits-only compare,
// so "(701) 799-1495", "701-799-1495", and "+17017991495" all match).
export async function findCustomerNameByPhone(digits: string): Promise<string | null> {
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_name, phone')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    for (const row of data ?? []) {
      const d = String(row.phone ?? '').replace(/\D/g, '')
      const normalized = d.length === 11 && d.startsWith('1') ? d.slice(1) : d
      if (normalized === digits) return (row.customer_name as string) || null
    }
    if (!data || data.length < PAGE) return null
  }
}

// How many orders are due on each date and not ready yet (still Active) — for the Need By calendar
export async function countOpenOrdersByDueDate(): Promise<Record<string, number>> {
  const PAGE = 1000
  const counts: Record<string, number> = {}
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('orders')
      .select('due_date')
      .eq('status', 'active')
      .eq('picked_up', false)
      .order('due_date')
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    for (const row of data ?? []) {
      const due = row.due_date as string
      if (due) counts[due] = (counts[due] ?? 0) + 1
    }
    if (!data || data.length < PAGE) return counts
  }
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderNumber = await nextOrderNumber()
  const { data, error } = await supabase
    .from('orders')
    .insert({
      id:            `#${orderNumber}`,
      order_number:  orderNumber,
      customer_name: input.customerName,
      phone:         input.phone,
      dropoff_date:  input.dropoffDate,
      due_date:      input.dueDate,
      notes:         input.notes ?? '',
      status:        'active',
      paid:          input.paid ?? false,
      picked_up:     false,
      created_at:    new Date().toISOString(),
      total_amount:  input.totalAmount  ?? null,
      item_count:    input.itemCount    ?? null,
      sms_consent:   input.smsConsent   ?? false,
      garments:      input.garments     ?? null,
      alterations:   input.alterations  ?? null,
    })
    .select()
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create order')
  return toOrder(data)
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Order | undefined> {
  const patch: Record<string, unknown> = {}
  if (input.status      !== undefined) patch.status       = input.status
  if (input.paid        !== undefined) patch.paid         = input.paid
  if (input.pickedUp    !== undefined) patch.picked_up    = input.pickedUp
  if (input.pickedUpAt  !== undefined) patch.picked_up_at = input.pickedUpAt
  if (input.notifiedAt  !== undefined) patch.notified_at  = input.notifiedAt
  if (input.completedAt !== undefined) patch.completed_at = input.completedAt
  if (input.totalAmount  !== undefined) patch.total_amount  = input.totalAmount
  if (input.itemCount    !== undefined) patch.item_count    = input.itemCount
  if (input.customerName !== undefined) patch.customer_name = input.customerName
  if (input.phone        !== undefined) patch.phone         = input.phone
  if (input.dropoffDate  !== undefined) patch.dropoff_date  = input.dropoffDate
  if (input.dueDate      !== undefined) patch.due_date      = input.dueDate
  if (input.notes        !== undefined) patch.notes         = input.notes
  if (input.history      !== undefined) patch.history       = input.history
  if (input.tailors      !== undefined) patch.tailors       = input.tailors

  const { data, error } = await supabase
    .from('orders').update(patch).eq('id', id).select().single()
  if (error || !data) return undefined
  return toOrder(data)
}
