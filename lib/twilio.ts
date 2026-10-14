import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

/**
 * Normalize any US phone number to E.164 format (+1XXXXXXXXXX) for Twilio.
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`
  return raw // already formatted or international
}

export interface SendResult {
  ok: boolean
  sid?: string    // Twilio message SID, when sent
  status?: string // Twilio's first status for it, e.g. 'queued'
  error?: string
  code?: number   // Twilio error code, e.g. 21610 = recipient replied STOP
}

// Where Twilio reports what happened to each text we send (app/api/sms/status)
const STATUS_CALLBACK_URL = process.env.TWILIO_STATUS_CALLBACK_URL ?? 'https://www.straustailor.com/api/sms/status'

/**
 * Shared Twilio SMS helper — used by all SMS-sending routes. Customer texts ask Twilio
 * to report delivered / not delivered, which shows next to the text in the app.
 */
export async function sendSMS(to: string, body: string, { trackDelivery = true } = {}): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const from       = process.env.TWILIO_FROM_NUMBER

  if (!accountSid || !authToken || !from) {
    console.warn('Twilio env vars not set — SMS not sent')
    return { ok: false, error: 'Twilio not configured' }
  }

  const params = new URLSearchParams({ To: normalizePhone(to), From: from, Body: body })
  if (trackDelivery) params.set('StatusCallback', STATUS_CALLBACK_URL)

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      Authorization:  twilioAuthHeader(accountSid, authToken),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: err.message ?? 'Twilio error', code: err.code }
  }

  const data = await res.json().catch(() => ({}))
  return { ok: true, sid: data.sid, status: data.status }
}

export function twilioAuthHeader(accountSid: string, authToken: string): string {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
}

/**
 * The X-Twilio-Signature Twilio would send for this URL and form body:
 * HMAC-SHA1 (keyed with the auth token) of the URL followed by every
 * param name+value, sorted by name with case-sensitive ordering.
 */
export function twilioSignature(authToken: string, url: string, params: URLSearchParams): string {
  const sorted = [...params.entries()].sort(([a, av], [b, bv]) =>
    a < b ? -1 : a > b ? 1 : av < bv ? -1 : av > bv ? 1 : 0
  )
  const data = url + sorted.map(([k, v]) => k + v).join('')
  return createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64')
}

// The URLs Twilio may have signed for a webhook request. Behind Vercel the public host and
// protocol arrive in forwarded headers, and Twilio has signed both with and without the default port.
export function signedUrlCandidates(req: NextRequest): string[] {
  const first = (h: string | null) => h?.split(',')[0].trim() ?? ''
  const proto = first(req.headers.get('x-forwarded-proto')) || req.nextUrl.protocol.replace(/:$/, '')
  const host  = first(req.headers.get('x-forwarded-host')) || first(req.headers.get('host')) || req.nextUrl.host
  const path  = req.nextUrl.pathname + req.nextUrl.search
  const defaultPort = proto === 'https' ? '443' : '80'
  const bareHost = host.endsWith(`:${defaultPort}`) ? host.slice(0, -defaultPort.length - 1) : host
  return [...new Set([
    `${proto}://${bareHost}${path}`,
    `${proto}://${bareHost}${bareHost.includes(':') ? '' : `:${defaultPort}`}${path}`,
    req.url,
  ])]
}

/**
 * True when the signature matches for any of the candidate URLs — the public
 * URL can differ slightly from what the server sees (e.g. an explicit :443).
 */
export function isValidTwilioSignature(signature: string, urls: string[], params: URLSearchParams): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken || !signature) return false
  const given = Buffer.from(signature)
  return urls.some(url => {
    const expected = Buffer.from(twilioSignature(authToken, url, params))
    return expected.length === given.length && timingSafeEqual(expected, given)
  })
}
