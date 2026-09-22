// Pure rules for customer texts — no database access, safe to use on client or server

// Twilio's built-in opt-out / opt-in keywords. Twilio enforces these itself;
// we mirror them only so staff can see why texts to someone are blocked.
const OPT_OUT = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'REVOKE', 'OPTOUT'])
const OPT_IN  = new Set(['START', 'UNSTOP'])

/** 'out' for STOP-style texts, 'in' for START-style texts — the whole text must be the keyword */
export function optKeyword(body: string): 'out' | 'in' | null {
  const k = body.trim().toUpperCase()
  if (OPT_OUT.has(k)) return 'out'
  if (OPT_IN.has(k)) return 'in'
  return null
}

/** Whether the customer's texts (oldest first) leave them opted out */
export function isOptedOut(inboundBodies: string[]): boolean {
  let out = false
  for (const body of inboundBodies) {
    const k = optKeyword(body)
    if (k === 'out') out = true
    // YES only re-subscribes someone who is currently opted out
    else if (k === 'in' || (out && body.trim().toUpperCase() === 'YES')) out = false
  }
  return out
}

export interface OrderCandidate {
  id: string
  orderNumber: number
  open: boolean // not completed or picked up yet
}

// 5-digit order numbers quoted in a text ("Is #12345 ready?"), ignoring digits inside longer numbers
function quotedOrderNumbers(body: string): Set<number> {
  return new Set((body.match(/(?<!\d)\d{5}(?!\d)/g) ?? []).map(Number))
}

/**
 * Decide which order a customer's text is most likely about.
 * `orders` are that customer's orders, newest first.
 */
export function pickOrderForText(
  orders: OrderCandidate[],
  body: string,
  lastTextedOrderId?: string | null,
): string | null {
  if (orders.length === 0) return null

  // 1. They quoted one of their order numbers
  const quoted = quotedOrderNumbers(body)
  const byNumber = orders.find(o => quoted.has(o.orderNumber))
  if (byNumber) return byNumber.id

  // 2. They're replying to our last text, and that order is still in progress
  const replyTo = orders.find(o => o.id === lastTextedOrderId && o.open)
  if (replyTo) return replyTo.id

  // 3. Their newest order still in progress, else their newest order
  return (orders.find(o => o.open) ?? orders[0]).id
}

export interface HistoryOrder {
  id: string
  orderNumber: number
  createdAt: string // ISO
}

/**
 * Which order an older text (from before the app saved texts) was about —
 * judged by when it was sent, since order statuses have changed since.
 */
export function pickOrderForHistory(orders: HistoryOrder[], body: string, sentAt: string): string | null {
  // 1. The text quotes one of their order numbers (Ready texts include "Order: #12345")
  const quoted = quotedOrderNumbers(body)
  const byNumber = orders.find(o => quoted.has(o.orderNumber))
  if (byNumber) return byNumber.id

  // 2. Their newest order that existed when the text was sent (a minute of slack for clock differences)
  const cutoff = Date.parse(sentAt) + 60_000
  let best: HistoryOrder | null = null
  for (const o of orders) {
    const created = Date.parse(o.createdAt)
    if (created <= cutoff && (!best || created > Date.parse(best.createdAt))) best = o
  }
  return best?.id ?? null
}
