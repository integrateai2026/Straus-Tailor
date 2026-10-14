import { NextRequest, NextResponse } from 'next/server'
import { isValidTwilioSignature, signedUrlCandidates } from '@/lib/twilio'
import { recordDeliveryStatus } from '@/lib/messages'

export const runtime = 'nodejs'

// Twilio calls this as a text we sent moves along: sent, then delivered — or undelivered /
// failed with an error code. Each send asks for it (StatusCallback in lib/twilio.ts).
// Public route — the Twilio signature is the auth.
export async function POST(req: NextRequest) {
  const params = new URLSearchParams(await req.text())

  const signature = req.headers.get('x-twilio-signature') ?? ''
  if (!isValidTwilioSignature(signature, signedUrlCandidates(req), params)) {
    console.warn('[SMS] Rejected delivery status webhook: bad or missing Twilio signature')
    return new NextResponse('Invalid signature', { status: 403 })
  }

  const sid    = params.get('MessageSid') ?? params.get('SmsSid') ?? ''
  const status = params.get('MessageStatus') ?? params.get('SmsStatus') ?? ''
  if (sid && status) {
    try {
      await recordDeliveryStatus(sid, status, params.get('ErrorCode'))
    } catch (err) {
      console.error('[SMS] Failed to save delivery status:', err)
      return new NextResponse('Could not save status', { status: 500 })
    }
  }

  return new NextResponse(null, { status: 204 })
}
