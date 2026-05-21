import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder } from '@/lib/store'
import { sendSMS } from '@/lib/twilio'
import { requireAuth } from '@/lib/session'

export async function POST(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { orderId, phone, message } = await req.json()

    if (!orderId || !phone || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const result = await sendSMS(phone, message)
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'SMS failed' }, { status: 500 })
    }

    // Append this send time to the notifiedAt history
    const current = await getOrderById(orderId)
    const existing: string[] = Array.isArray(current?.notifiedAt)
      ? current.notifiedAt
      : current?.notifiedAt
        ? [current.notifiedAt as unknown as string]
        : []

    const updated = await updateOrder(orderId, {
      status: 'notified',
      notifiedAt: [...existing, new Date().toISOString()],
    })

    return NextResponse.json({ success: true, order: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
