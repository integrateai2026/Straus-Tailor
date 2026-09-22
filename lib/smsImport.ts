import { supabase } from './supabase'
import { normalizePhone, twilioAuthHeader } from './twilio'
import { phoneDigits } from './phone'
import type { HistoryOrder } from './smsRules'
import { historyRows, type TwilioLogMessage } from './smsHistory'
import type { StoredMedia } from './messages'

const TWILIO = 'https://api.twilio.com'
const PAGE = 1000

// Customer orders keyed by phone digits, for matching old texts to orders
async function ordersByPhone(): Promise<Map<string, HistoryOrder[]>> {
  const map = new Map<string, HistoryOrder[]>()
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, phone_digits, created_at')
      .order('created_at', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    for (const o of data ?? []) {
      const list = map.get(o.phone_digits as string) ?? []
      list.push({ id: o.id as string, orderNumber: o.order_number as number, createdAt: o.created_at as string })
      map.set(o.phone_digits as string, list)
    }
    if (!data || data.length < PAGE) return map
  }
}

// Twilio SIDs of texts the app already has
async function savedSids(): Promise<Set<string>> {
  const sids = new Set<string>()
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('sms_messages')
      .select('twilio_sid')
      .not('twilio_sid', 'is', null)
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    for (const r of data ?? []) sids.add(r.twilio_sid as string)
    if (!data || data.length < PAGE) return sids
  }
}

/**
 * Copy texts from Twilio's message log (the last 13 months) into the app, so older
 * conversations show on their orders. Safe to run again — texts already saved are skipped.
 * Reading the log is a free Twilio API call; nothing is sent.
 */
export async function importTwilioHistory(): Promise<{ found: number; added: number }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_FROM_NUMBER
  if (!accountSid || !authToken || !from) throw new Error('Twilio is not configured')

  const auth = twilioAuthHeader(accountSid, authToken)
  const shop = normalizePhone(from)

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(TWILIO + path, { headers: { Authorization: auth } })
    if (!res.ok) throw new Error(`Twilio returned ${res.status}`)
    return res.json() as Promise<T>
  }

  // Every text to or from the shop number, following Twilio's pages
  async function listMessages(filter: 'To' | 'From'): Promise<TwilioLogMessage[]> {
    const all: TwilioLogMessage[] = []
    let next: string | null =
      `/2010-04-01/Accounts/${accountSid}/Messages.json?${filter}=${encodeURIComponent(shop)}&PageSize=${PAGE}`
    while (next) {
      const page: { messages: TwilioLogMessage[]; next_page_uri: string | null } = await get(next)
      all.push(...page.messages)
      next = page.next_page_uri
    }
    return all
  }

  const [received, sent, orders, saved] = await Promise.all([
    listMessages('To'),
    listMessages('From'),
    ordersByPhone(),
    savedSids(),
  ])

  const staff = process.env.TWILIO_STAFF_ALERT_NUMBER
  const rows = historyRows([...received, ...sent], {
    shopDigits:    phoneDigits(shop),
    staffDigits:   staff ? phoneDigits(staff) : null,
    ordersByPhone: orders,
    importedAt:    new Date().toISOString(),
  })
  const fresh = rows.filter(r => !saved.has(r.twilio_sid))

  // Photo locations, a few at a time. A photo Twilio no longer has just leaves the text without it.
  const media = new Map<string, StoredMedia[]>()
  const withPhotos = fresh.filter(r => r.mediaCount > 0)
  for (let i = 0; i < withPhotos.length; i += 5) {
    await Promise.all(withPhotos.slice(i, i + 5).map(async r => {
      try {
        const list: { media_list: { content_type: string | null; uri: string | null }[] } =
          await get(`/2010-04-01/Accounts/${accountSid}/Messages/${r.twilio_sid}/Media.json`)
        media.set(r.twilio_sid, list.media_list
          .filter(m => m.uri)
          .map(m => ({ url: TWILIO + m.uri!.replace(/\.json$/, ''), contentType: m.content_type ?? 'application/octet-stream' })))
      } catch (err) {
        console.warn(`[SMS] Couldn't list photos for ${r.twilio_sid}:`, err)
      }
    }))
  }

  // Save in batches; a text that arrived through the webhook meanwhile is skipped, not duplicated
  let added = 0
  for (let i = 0; i < fresh.length; i += 500) {
    const batch = fresh.slice(i, i + 500).map(r => {
      const photos = media.get(r.twilio_sid)
      return {
        twilio_sid: r.twilio_sid,
        phone:      r.phone,
        order_id:   r.order_id,
        direction:  r.direction,
        body:       r.body,
        created_at: r.created_at,
        read_at:    r.read_at,
        media:      photos?.length ? photos : null,
      }
    })
    const { data, error } = await supabase
      .from('sms_messages')
      .upsert(batch, { onConflict: 'twilio_sid', ignoreDuplicates: true })
      .select('id')
    if (error) throw new Error(error.message)
    added += data?.length ?? 0
  }

  console.log(`[SMS] Imported ${added} of ${rows.length} texts from Twilio`)
  return { found: rows.length, added }
}
