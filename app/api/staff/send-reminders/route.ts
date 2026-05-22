import { NextRequest, NextResponse } from 'next/server'
import { sendDueReminders } from '@/lib/reminders'
import { requireAuth } from '@/lib/session'

export const runtime = 'nodejs'

// Staff-triggered reminder — protected by session cookie (same as staff dashboard)
export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await sendDueReminders()
  return NextResponse.json(result)
}
