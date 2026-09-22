// Pure: turn Twilio's message log into conversation rows — no network or database access
import { phoneDigits } from './phone'
import { pickOrderForHistory, type HistoryOrder } from './smsRules'

// The fields we use from Twilio's Message resource
export interface TwilioLogMessage {
  sid: string
  from: string | null
  to: string | null
  body: string | null
  status: string
  direction: string // 'inbound' | 'outbound-api' | 'outbound-reply' | 'outbound-call'
  date_sent: string | null
  date_created: string | null
  num_media: string | null
}

export interface HistoryRow {
  twilio_sid: string
  phone: string
  order_id: string | null
  direction: 'inbound' | 'outbound'
  body: string
  created_at: string
  read_at: string | null
  mediaCount: number // photos to look up separately; not a table column
}

// Texts that actually reached, or came from, the customer — failed and undelivered sends are left out
const COMPLETED = new Set(['received', 'delivered', 'sent', 'read'])

// Customer texts newer than this stay unread, so anything from today still gets noticed
const STILL_NEW_MS = 24 * 60 * 60 * 1000

export function historyRows(
  messages: TwilioLogMessage[],
  opts: {
    shopDigits: string                          // the shop's Twilio number
    staffDigits: string | null                  // where staff reminder texts go
    ordersByPhone: Map<string, HistoryOrder[]>  // customer orders keyed by phone digits
    importedAt: string                          // older customer texts count as read from now
  },
): HistoryRow[] {
  const rows: HistoryRow[] = []
  const importTime = Date.parse(opts.importedAt)
  for (const m of messages) {
    if (!COMPLETED.has(m.status)) continue
    const inbound = m.direction === 'inbound'
    const phone = phoneDigits((inbound ? m.from : m.to) ?? '')
    if (!phone || phone === opts.shopDigits) continue
    // Staff reminder texts aren't customer conversations (they've always started with ⚠️)
    const body = m.body ?? ''
    if (phone === opts.staffDigits || (!inbound && body.startsWith('⚠️'))) continue

    const when = m.date_sent ?? m.date_created
    const time = when ? Date.parse(when) : NaN
    if (Number.isNaN(time)) continue
    const createdAt = new Date(time).toISOString()

    rows.push({
      twilio_sid: m.sid,
      phone,
      order_id:   pickOrderForHistory(opts.ordersByPhone.get(phone) ?? [], body, createdAt),
      direction:  inbound ? 'inbound' : 'outbound',
      body,
      created_at: createdAt,
      read_at:    inbound && importTime - time > STILL_NEW_MS ? opts.importedAt : null,
      mediaCount: inbound ? parseInt(m.num_media ?? '0', 10) || 0 : 0,
    })
  }
  return rows
}
