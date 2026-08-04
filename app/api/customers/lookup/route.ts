import { NextRequest, NextResponse } from 'next/server'
import { findCustomerNameByPhone } from '@/lib/store'
import { requireAuth } from '@/lib/session'

export const runtime = 'nodejs'

// Returning-customer lookup for the in-store form. Session-protected —
// the form tablet is logged in, so outsiders can't probe names by phone number.
export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const digits = (req.nextUrl.searchParams.get('phone') ?? '').replace(/\D/g, '')
  if (digits.length !== 10) {
    return NextResponse.json({ found: false })
  }
  const name = await findCustomerNameByPhone(digits)
  return NextResponse.json(name ? { found: true, customerName: name } : { found: false })
}
