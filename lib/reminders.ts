import { getAllOrders } from '@/lib/store'
import { sendSMS } from '@/lib/twilio'
import { Order } from '@/lib/types'

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isUnnotified(o: Order): boolean {
  if (o.status === 'completed' || o.pickedUp) return false
  if (!o.notifiedAt) return true
  if (Array.isArray(o.notifiedAt)) return o.notifiedAt.length === 0
  return false
}

export async function sendDueReminders(): Promise<{ sent: number; message?: string; result?: string }> {
  const staffNumber = process.env.TWILIO_STAFF_ALERT_NUMBER
  if (!staffNumber) return { sent: 0, message: 'TWILIO_STAFF_ALERT_NUMBER not set' }

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const todayStr    = dateStr(now)
  const tomorrowStr = dateStr(new Date(now.getTime() + 86400000))

  const orders = await getAllOrders()

  const todayOrders    = orders.filter(o => o.dueDate === todayStr    && isUnnotified(o))
  const tomorrowOrders = orders.filter(o => o.dueDate === tomorrowStr && isUnnotified(o))
  const total = todayOrders.length + tomorrowOrders.length

  if (total === 0) {
    return { sent: 0, message: 'No unnotified orders due today or tomorrow' }
  }

  const lines: string[] = ['⚠️ Straus — Orders to Notify', '']

  if (todayOrders.length > 0) {
    lines.push(`Due Today (${shortDate(todayStr)}):`)
    for (const o of todayOrders) {
      lines.push(`• ${o.customerName} — ${o.phone}`)
    }
    lines.push('')
  }

  if (tomorrowOrders.length > 0) {
    lines.push(`Due Tomorrow (${shortDate(tomorrowStr)}):`)
    for (const o of tomorrowOrders) {
      lines.push(`• ${o.customerName} — ${o.phone}`)
    }
    lines.push('')
  }

  lines.push('Check dashboard to notify.')

  const msg = lines.join('\n')
  const result = await sendSMS(staffNumber, msg)

  return {
    sent: result.ok ? total : 0,
    result: result.ok ? `Sent 1 SMS for ${total} order${total > 1 ? 's' : ''}` : result.error,
  }
}
