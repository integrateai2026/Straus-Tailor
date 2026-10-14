import { NextRequest, NextResponse } from 'next/server'
import { isValidTwilioSignature, signedUrlCandidates } from '@/lib/twilio'
import { recordInbound, StoredMedia } from '@/lib/messages'

export const runtime = 'nodejs'

// Twilio calls this when a customer texts the shop number (set as the number's
// "A message comes in" webhook). Public route — the Twilio signature is the auth.

// Empty TwiML: take the text without sending the customer an automatic reply
const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'

export async function POST(req: NextRequest) {
  const params = new URLSearchParams(await req.text())

  const signature = req.headers.get('x-twilio-signature') ?? ''
  if (!isValidTwilioSignature(signature, signedUrlCandidates(req), params)) {
    console.warn('[SMS] Rejected incoming text webhook: bad or missing Twilio signature')
    return new NextResponse('Invalid signature', { status: 403 })
  }

  const from = params.get('From') ?? ''
  const sid  = params.get('MessageSid') ?? params.get('SmsMessageSid') ?? ''
  const numMedia = Math.min(parseInt(params.get('NumMedia') ?? '0', 10) || 0, 10)
  const media: StoredMedia[] = []
  for (let i = 0; i < numMedia; i++) {
    const url = params.get(`MediaUrl${i}`)
    if (url) media.push({ url, contentType: params.get(`MediaContentType${i}`) ?? 'application/octet-stream' })
  }

  if (from) {
    try {
      await recordInbound({ from, body: (params.get('Body') ?? '').slice(0, 2000), media, sid })
      console.log(`[SMS] Saved incoming text ${sid}`)
    } catch (err) {
      console.error('[SMS] Failed to save incoming text:', err)
      return new NextResponse('Could not save message', { status: 500 })
    }
  }

  return new NextResponse(EMPTY_TWIML, { headers: { 'Content-Type': 'text/xml' } })
}
