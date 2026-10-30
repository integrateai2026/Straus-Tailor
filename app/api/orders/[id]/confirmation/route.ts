import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getOrderById } from '@/lib/store'
import { sendSMS } from '@/lib/twilio'
import { logOutbound } from '@/lib/messages'
import { phoneDigits } from '@/lib/phone'
import { confirmationText } from '@/lib/smsTemplates'

// Staff "Test SMS": send the order's first text (the confirmation) again to the number on
// the order, e.g. after fixing a mistyped number. Unlike the Ready text, it doesn't change the order.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const order = await getOrderById(decodeURIComponent(id))
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (!order.smsConsent) {
    return NextResponse.json({ error: 'This customer didn’t agree to texts.' }, { status: 409 })
  }
  if (phoneDigits(order.phone).length !== 10) {
    return NextResponse.json({ error: 'The phone number on the order is incomplete.' }, { status: 400 })
  }

  const body = confirmationText(order)
  const result = await sendSMS(order.phone, body)
  if (!result.ok) {
    const error = result.code === 21610
      ? 'They replied STOP, so texts to this number are blocked.'
      : `Not sent: ${result.error ?? 'Twilio error'}`
    return NextResponse.json({ error }, { status: 502 })
  }

  // In the order's Messages box, where its Delivered / Not delivered label shows up
  await logOutbound({ phone: order.phone, body, orderId: order.id, sid: result.sid, status: result.status })
  return NextResponse.json({ ok: true })
}
