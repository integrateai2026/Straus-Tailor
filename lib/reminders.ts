import { getAllOrders } from '@/lib/store'
import { sendSMS } from '@/lib/twilio'
import { Order } from '@/lib/types'
import { buildReminderTexts } from '@/lib/reminderText'

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

export async function sendDueReminders(): Promise<{ sent: number; message?: string; result?: string; error?: string }> {
  const staffNumber = process.env.TWILIO_STAFF_ALERT_NUMBER
  if (!staffNumber) return { sent: 0, error: 'TWILIO_STAFF_ALERT_NUMBER not set' }

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

  const texts = buildReminderTexts([
    { title: `DUE TODAY (${shortDate(todayStr)})`,       orders: todayOrders },
    { title: `DUE TOMORROW (${shortDate(tomorrowStr)})`, orders: tomorrowOrders },
  ])

  // Send in order; stop and report if any part fails so a failure is never mistaken for "no orders"
  for (let i = 0; i < texts.length; i++) {
    const result = await sendSMS(staffNumber, texts[i])
    if (!result.ok) {
      const which = texts.length > 1 ? ` (text ${i + 1} of ${texts.length})` : ''
      return { sent: 0, error: `Reminder failed to send${which}: ${result.error ?? 'unknown error'}` }
    }
  }

  const s = (n: number) => (n === 1 ? '' : 's')
  return {
    sent: total,
    result: `Sent ${texts.length} text${s(texts.length)} for ${total} order${s(total)}`,
  }
}
