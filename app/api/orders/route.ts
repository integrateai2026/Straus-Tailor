import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, createOrder } from '@/lib/store'
import { CreateOrderInput } from '@/lib/types'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.toLowerCase()
  const status = searchParams.get('status')

  let orders = getAllOrders()

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.status === status)
  }

  if (query) {
    orders = orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(query) ||
        o.phone.includes(query) ||
        o.id.includes(query)
    )
  }

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()

    const rawAmount = parseFloat(String(raw.totalAmount ?? ''))
    const rawItems  = parseInt(String(raw.itemCount ?? ''), 10)

    const input: CreateOrderInput = {
      customerName: String(raw.customerName ?? '').trim().slice(0, 100),
      phone:        String(raw.phone        ?? '').trim().slice(0, 25),
      dropoffDate:  String(raw.dropoffDate  ?? '').trim(),
      dueDate:      String(raw.dueDate      ?? '').trim(),
      notes:        String(raw.notes        ?? '').trim().slice(0, 1000),
      paid:         raw.paid === true,
      ...(isFinite(rawAmount) && rawAmount >= 0 && { totalAmount: Math.round(rawAmount * 100) / 100 }),
      ...(isFinite(rawItems)  && rawItems  >= 1 && { itemCount: rawItems }),
    }

    if (!input.customerName || !input.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }
    if (!DATE_RE.test(input.dropoffDate) || !DATE_RE.test(input.dueDate)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const order = createOrder(input)
    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
