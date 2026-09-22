import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { importTwilioHistory } from '@/lib/smsImport'

export const runtime = 'nodejs'
export const maxDuration = 60

// Staff button: bring older texts from Twilio's message log into the app (safe to repeat)
export async function POST(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return NextResponse.json(await importTwilioHistory())
  } catch (err) {
    console.error('[SMS] Import failed:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Import failed' }, { status: 502 })
  }
}
