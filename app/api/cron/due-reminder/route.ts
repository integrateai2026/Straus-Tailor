import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/store'
import { sendSMS } from '@/lib/twilio'

export const runtime = 'nodejs'

// Called daily by Vercel Cron at 9am CT (also 8am CDT in summer)
// Sends a staff alert for every active order due tomorrow with no SMS sent yet
export async function GET(req: NextRequest) {
  const staffNumber = process.env.TWILIO_STAFF_ALERT_NUMBER
  if (!staffNumber) {
    return NextResponse.json({ error: 'TWILIO_STAFF_ALERT_NUMBER not set' }, { status: 500 })
  }

  // Get all orders
  const orders = await getAllOrders()

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  function dateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const todayStr    = dateStr(now)
  const tomorrowStr = dateStr(new Date(now.getTime() + 86400000))

  // Alert for orders due today OR tomorrow that haven't been notified yet
  const dueOrders = orders.filter(o =>
    (o.dueDate === todayStr || o.dueDate === tomorrowStr) &&
    o.status !== 'completed' &&
    !o.pickedUp &&
    (!o.notifiedAt || (Array.isArray(o.notifiedAt) ? o.notifiedAt.length === 0 : !o.notifiedAt))
  )

  if (dueOrders.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No unnotified orders due today or tomorrow' })
  }

  const results: string[] = []

  for (const order of dueOrders) {
    const isToday = order.dueDate === todayStr
    const due = new Date(order.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    })
    const totalLine = order.totalAmount != null ? `\nTotal: $${order.totalAmount.toFixed(2)}` : ''
    const msg = [
      `⚠️ Order Due ${isToday ? 'TODAY' : 'Tomorrow'} — Not Yet Notified`,
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

  return NextResponse.json({ sent: dueOrders.length, results })
}
