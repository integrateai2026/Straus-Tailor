import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getThreads } from '@/lib/messages'

export const runtime = 'nodejs'

// Recent customer conversations + unread count — polled by the staff app for notifications
export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return NextResponse.json(await getThreads())
  } catch (err) {
    console.error('[SMS] Failed to load conversations:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
