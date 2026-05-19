import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, createOrder } from '@/lib/store'
import { CreateOrderInput } from '@/lib/types'
import { sendSMS } from '@/lib/twilio'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? undefined
  const query  = searchParams.get('q')      ?? undefined

  const orders = await getAllOrders(status, query)
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
      smsConsent:   raw.smsConsent === true || raw.smsTransactional === true,
      ...(isFinite(rawAmount) && rawAmount >= 0 && { totalAmount: Math.round(rawAmount * 100) / 100 }),
      ...(isFinite(rawItems)  && rawItems  >= 1 && { itemCount: rawItems }),
      ...(raw.garments    && typeof raw.garments === 'object'  && { garments:    raw.garments }),
      ...(Array.isArray(raw.alterations)                       && { alterations: raw.alterations }),
    }

    if (!input.customerName || !input.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }
    if (!DATE_RE.test(input.dropoffDate) || !DATE_RE.test(input.dueDate)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const order = await createOrder(input)

    // Send customer confirmation SMS if they opted in
    if (raw.smsTransactional === true && input.phone) {
      const due = new Date(input.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      })
      const firstName = input.customerName.split(' ')[0]
      const totalLine = input.totalAmount != null ? `\nTotal: $${input.totalAmount.toFixed(2)}` : ''
      const msg = [
        `Hi ${firstName}! Your order has been received at Straus Tailor Shop.`,
        ``,
        `Order ID: ${order.id}`,
        `Due: ${due}${totalLine}`,
        ``,
        `We'll text you when it's ready for pickup.`,
        `Questions? Call (701) 929-8262`,
        `Reply STOP to opt out.`,
      ].join('\n')
      sendSMS(input.phone, msg).catch(console.error) // fire and forget
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
