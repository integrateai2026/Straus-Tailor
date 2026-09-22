import { supabase } from './supabase'
import { SmsDirection, SmsMessage, SmsThread } from './types'
import { phoneDigits } from './phone'
import { isOptedOut, pickOrderForText } from './smsRules'

// Twilio's copy of an MMS attachment — the URL needs our Twilio credentials, so it never leaves the server
export interface StoredMedia {
  url: string
  contentType: string
}

const COLUMNS = 'id, phone, order_id, direction, body, media, created_at, read_at'

// Map Supabase snake_case row → camelCase SmsMessage
function toMessage(row: Record<string, unknown>): SmsMessage {
  const media = (row.media as StoredMedia[] | null) ?? []
  return {
    id:        row.id         as string,
    phone:     row.phone      as string,
    direction: row.direction  as SmsDirection,
    body:      row.body       as string,
    media:     media.map(m => ({ contentType: m.contentType })),
    createdAt: row.created_at as string,
    ...(row.order_id ? { orderId: row.order_id as string } : {}),
    ...(row.read_at  ? { readAt:  row.read_at  as string } : {}),
  }
}

/**
 * Save a text Twilio accepted for delivery so it shows in the conversation.
 * Never throws — the text has already gone out, so a logging failure mustn't look like a send failure.
 */
export async function logOutbound(input: {
  phone: string
  body: string
  orderId?: string | null
  sid?: string
}): Promise<SmsMessage | null> {
  try {
    const { data, error } = await supabase
      .from('sms_messages')
      .insert({
        phone:      phoneDigits(input.phone),
        order_id:   input.orderId ?? null,
        direction:  'outbound',
        body:       input.body,
        twilio_sid: input.sid ?? null,
      })
      .select(COLUMNS)
      .single()
    if (error || !data) throw new Error(error?.message ?? 'no row returned')
    return toMessage(data)
  } catch (err) {
    console.error('[SMS] Failed to save outbound text:', err)
    return null
  }
}

// Which of this customer's orders a text is about — see pickOrderForText for the rules
async function matchOrder(phone: string, body: string): Promise<string | null> {
  if (phone.length !== 10) return null
  const [orders, lastSent] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, status, picked_up')
      .eq('phone_digits', phone)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('sms_messages')
      .select('order_id')
      .eq('phone', phone)
      .eq('direction', 'outbound')
      .not('order_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  if (orders.error) console.error('[SMS] Order lookup failed:', orders.error.message)

  const candidates = (orders.data ?? []).map(o => ({
    id:          o.id as string,
    orderNumber: o.order_number as number,
    open:        o.status !== 'completed' && !o.picked_up,
  }))
  return pickOrderForText(candidates, body, lastSent.data?.order_id as string | undefined)
}

/** Save a text a customer sent us. Twilio can retry a webhook, so repeats of the same SID are ignored. */
export async function recordInbound(input: {
  from: string
  body: string
  media: StoredMedia[]
  sid: string
}): Promise<void> {
  const phone = phoneDigits(input.from)
  const orderId = await matchOrder(phone, input.body)
  const { error } = await supabase
    .from('sms_messages')
    .upsert({
      phone,
      order_id:   orderId,
      direction:  'inbound',
      body:       input.body,
      media:      input.media.length ? input.media : null,
      twilio_sid: input.sid || null,
    }, { onConflict: 'twilio_sid', ignoreDuplicates: true })
  if (error) throw new Error(error.message)
}

/** Whether any order for this number has SMS consent */
async function hasSmsConsent(phone: string): Promise<boolean> {
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('phone_digits', phone)
    .eq('sms_consent', true)
  return (count ?? 0) > 0
}

/**
 * Staff may text a number once the customer has opted in on an order,
 * or has texted the shop themselves (replying to them is always allowed).
 */
export async function canTextPhone(phone: string): Promise<boolean> {
  const [consent, inbound] = await Promise.all([
    hasSmsConsent(phone),
    supabase
      .from('sms_messages')
      .select('id', { count: 'exact', head: true })
      .eq('phone', phone)
      .eq('direction', 'inbound'),
  ])
  return consent || (inbound.count ?? 0) > 0
}

/** The order id if that order exists and has this phone number, else null */
export async function orderIdForPhone(orderId: string | null | undefined, phone: string): Promise<string | null> {
  if (!orderId) return null
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('id', orderId)
    .eq('phone_digits', phone)
    .maybeSingle()
  return (data?.id as string | undefined) ?? null
}

/** The conversation with one number, oldest first (latest 200 texts) */
export async function getThread(phone: string): Promise<{
  messages: SmsMessage[]
  optedOut: boolean
  canText: boolean
}> {
  const [res, consent] = await Promise.all([
    supabase
      .from('sms_messages')
      .select(COLUMNS)
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(200),
    hasSmsConsent(phone),
  ])
  if (res.error) throw new Error(res.error.message)

  const messages = (res.data ?? []).reverse().map(toMessage)
  const inbound = messages.filter(m => m.direction === 'inbound')
  return {
    messages,
    optedOut: isOptedOut(inbound.map(m => m.body)),
    canText:  consent || inbound.length > 0,
  }
}

export async function markThreadRead(phone: string): Promise<void> {
  const { error } = await supabase
    .from('sms_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('phone', phone)
    .eq('direction', 'inbound')
    .is('read_at', null)
  if (error) throw new Error(error.message)
}

/** Recent conversations (numbers that have texted us), newest first, plus the total unread count */
export async function getThreads(): Promise<{ unread: number; threads: SmsThread[] }> {
  const [threads, unread] = await Promise.all([
    supabase.rpc('sms_threads', { max_threads: 50 }),
    supabase
      .from('sms_messages')
      .select('id', { count: 'exact', head: true })
      .eq('direction', 'inbound')
      .is('read_at', null),
  ])
  if (threads.error) throw new Error(threads.error.message)
  if (unread.error) throw new Error(unread.error.message)

  const rows = (threads.data ?? []) as Record<string, unknown>[]
  return {
    unread: unread.count ?? 0,
    threads: rows.map(r => ({
      phone:         r.phone          as string,
      unread:        r.unread         as number,
      lastBody:      r.last_body      as string,
      lastDirection: r.last_direction as SmsDirection,
      lastAt:        r.last_at        as string,
      lastHasMedia:  r.last_has_media as boolean,
      ...(r.order_id      ? { orderId:      r.order_id      as string } : {}),
      ...(r.customer_name ? { customerName: r.customer_name as string } : {}),
    })),
  }
}

/** The stored Twilio location of one attachment on a text */
export async function getMedia(messageId: string, index: number): Promise<StoredMedia | null> {
  const { data } = await supabase
    .from('sms_messages')
    .select('media')
    .eq('id', messageId)
    .maybeSingle()
  const media = (data?.media as StoredMedia[] | null) ?? []
  return media[index] ?? null
}
