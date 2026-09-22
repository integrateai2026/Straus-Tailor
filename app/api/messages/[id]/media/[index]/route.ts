import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getMedia } from '@/lib/messages'
import { twilioAuthHeader } from '@/lib/twilio'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

// A photo (or other attachment) a customer texted in. Twilio only serves it with our
// credentials, so fetch it here and pass the browser Twilio's short-lived file link.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; index: string }> }) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, index } = await params
  const i = Number(index)
  if (!UUID_RE.test(id) || !Number.isInteger(i) || i < 0 || i > 9) return notFound()

  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const media = await getMedia(id, i)
  if (!media || !accountSid || !authToken) return notFound()

  // Our credentials must only ever go to Twilio's own API
  let source: URL
  try { source = new URL(media.url) } catch { return notFound() }
  if (source.protocol !== 'https:' || source.hostname !== 'api.twilio.com') return notFound()

  const res = await fetch(source, {
    headers:  { Authorization: twilioAuthHeader(accountSid, authToken) },
    redirect: 'manual', // don't carry the credentials along to wherever Twilio redirects
  })

  const location = res.headers.get('location')
  if (res.status >= 300 && res.status < 400 && location) {
    return NextResponse.redirect(new URL(location, source), {
      status:  302,
      headers: { 'Cache-Control': 'private, max-age=300' },
    })
  }
  if (!res.ok || !res.body) return notFound()

  // Served from our own domain — never let an attachment run as a web page here
  return new NextResponse(res.body, {
    headers: {
      'Content-Type':            res.headers.get('content-type') ?? media.contentType,
      'Content-Security-Policy': 'sandbox',
      'X-Content-Type-Options':  'nosniff',
      'Cache-Control':           'private, max-age=86400',
    },
  })
}
