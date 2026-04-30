import { supabase } from './supabase'
import { Order, CreateOrderInput, UpdateOrderInput } from './types'

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
    ...(row.total_amount != null ? { totalAmount: row.total_amount as number } : {}),
    ...(row.item_count   != null ? { itemCount:   row.item_count   as number } : {}),
  }
}

async function uniqueOrderNumber(): Promise<number> {
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(10000 + Math.random() * 90000)
    const { data } = await supabase
      .from('orders').select('id').eq('order_number', num).maybeSingle()
    if (!data) return num
  }
  throw new Error('Could not generate a unique order number')
}

export async function getAllOrders(status?: string, query?: string): Promise<Order[]> {
  let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all') q = q.eq('status', status)
  if (query) {
    q = q.or(
      `customer_name.ilike.%${query}%,phone.ilike.%${query}%,id.ilike.%${query}%`
    )
  }
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map(toOrder)
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  return data ? toOrder(data) : undefined
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderNumber = await uniqueOrderNumber()
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
      total_amount:  input.totalAmount ?? null,
      item_count:    input.itemCount   ?? null,
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
  if (input.totalAmount !== undefined) patch.total_amount = input.totalAmount
  if (input.itemCount   !== undefined) patch.item_count   = input.itemCount

  const { data, error } = await supabase
    .from('orders').update(patch).eq('id', id).select().single()
  if (error || !data) return undefined
  return toOrder(data)
}
