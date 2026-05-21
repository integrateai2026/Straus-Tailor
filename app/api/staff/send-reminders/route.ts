import { NextRequest, NextResponse } from 'next/server'
import { sendDueReminders } from '@/lib/reminders'

export const runtime = 'nodejs'

// Manual trigger — protected by STAFF_ALERT_KEY (not CRON_SECRET which Vercel intercepts)
export async function GET(req: NextRequest) {
  const secret = process.env.STAFF_ALERT_KEY?.trim()
  const authHeader = req.headers.get('authorization')?.trim()
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await sendDueReminders()
  return NextResponse.json(result)
}
