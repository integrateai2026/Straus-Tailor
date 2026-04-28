import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, createOrder } from '@/lib/store'
import { CreateOrderInput } from '@/lib/types'

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
    const body = (await req.json()) as CreateOrderInput
    if (!body.customerName || !body.phone || !body.dropoffDate || !body.dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const order = createOrder(body)
    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
