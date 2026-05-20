import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/store'
import { sendSMS } from '@/lib/twilio'

export const runtime = 'nodejs'

// Called daily by Vercel Cron at 9am CT (also 8am CDT in summer)
// Sends a staff alert for every active order due tomorrow with no SMS sent yet
export async function GET(req: NextRequest) {
  // Fail closed — reject if CRON_SECRET not configured or header doesn't match
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const staffNumber = process.env.TWILIO_STAFF_ALERT_NUMBER
  if (!staffNumber) {
    return NextResponse.json({ error: 'TWILIO_STAFF_ALERT_NUMBER not set' }, { status: 500 })
  }

  // Get all active + notified orders
  const orders = await getAllOrders()

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`

  const dueTomorrow = orders.filter(o =>
    o.dueDate === tomorrowStr &&
    o.status !== 'completed' &&
    !o.pickedUp &&
    (!o.notifiedAt || (Array.isArray(o.notifiedAt) ? o.notifiedAt.length === 0 : !o.notifiedAt))
  )

  if (dueTomorrow.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No unnotified orders due tomorrow' })
  }

  const results: string[] = []

  for (const order of dueTomorrow) {
    const due = new Date(order.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
    const totalLine = order.totalAmount != null ? `\nTotal: $${order.totalAmount.toFixed(2)}` : ''
    const msg = [
      `⚠️ Order Due Tomorrow — Not Yet Notified`,
      ``,
      `Customer: ${order.customerName}`,
      `Phone: ${order.phone}`,
      `Order: ${order.id}`,
      `Due: ${due}${totalLine}`,
      ``,
      `Remember to notify this customer.`,
    ].join('\n')

    const result = await sendSMS(staffNumber, msg)
    results.push(`${order.id}: ${result.ok ? 'sent' : result.error}`)
  }

  return NextResponse.json({ sent: dueTomorrow.length, results })
}
