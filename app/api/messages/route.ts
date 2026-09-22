import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { phoneDigits } from '@/lib/phone'
import { sendSMS } from '@/lib/twilio'
import { canTextPhone, getThread, logOutbound, orderIdForPhone } from '@/lib/messages'

export const runtime = 'nodejs'

const MAX_LENGTH = 1600 // Twilio's limit for a single text

// Plain-English versions of the send errors staff are most likely to hit
const TWILIO_ERRORS: Record<number, string> = {
  21610: 'This customer replied STOP, so texts to them are blocked. They can text START to opt back in.',
  21211: "This phone number isn't valid.",
  21614: "This number can't receive texts — it may be a landline.",
}

// Conversation with one customer number: ?phone=7015550142
export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const phone = phoneDigits(req.nextUrl.searchParams.get('phone') ?? '')
  if (phone.length < 10) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }
  try {
    return NextResponse.json(await getThread(phone))
  } catch (err) {
    console.error('[SMS] Failed to load conversation:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Staff reply / free-form text to a customer
export async function POST(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const raw   = await req.json()
    const phone = phoneDigits(String(raw.phone ?? ''))
    const body  = String(raw.body ?? '').trim()

    if (phone.length < 10 || !body) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (body.length > MAX_LENGTH) {
      return NextResponse.json({ error: `Message is too long (${MAX_LENGTH} characters max)` }, { status: 400 })
    }
    if (!(await canTextPhone(phone))) {
      return NextResponse.json({ error: "This customer hasn't agreed to receive texts" }, { status: 403 })
    }

    const result = await sendSMS(phone, body)
    if (!result.ok) {
      const error = (result.code && TWILIO_ERRORS[result.code]) || result.error || 'SMS failed'
      return NextResponse.json({ error }, { status: 502 })
    }

    const orderId = await orderIdForPhone(typeof raw.orderId === 'string' ? raw.orderId : null, phone)
    const message = await logOutbound({ phone, body, orderId, sid: result.sid })
    return NextResponse.json({ message })
  } catch (err) {
    console.error('[SMS] Reply failed:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
