import { NextRequest, NextResponse } from 'next/server'
import { sendDueReminders } from '@/lib/reminders'

export const runtime = 'nodejs'

// Called daily by Vercel Cron at 8am CDT (13:00 UTC)
export async function GET(_req: NextRequest) {
  const result = await sendDueReminders()
  return NextResponse.json(result)
}
