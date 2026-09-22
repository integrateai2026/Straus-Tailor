import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { phoneDigits } from '@/lib/phone'
import { markThreadRead } from '@/lib/messages'

export const runtime = 'nodejs'

// Staff opened a conversation — clear its unread texts
export async function POST(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { phone: raw } = await req.json()
    const phone = phoneDigits(String(raw ?? ''))
    if (phone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    await markThreadRead(phone)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[SMS] Failed to mark conversation read:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
