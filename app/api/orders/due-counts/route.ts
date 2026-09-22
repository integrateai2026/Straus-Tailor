import { NextRequest, NextResponse } from 'next/server'
import { countOpenOrdersByDueDate } from '@/lib/store'
import { requireAuth } from '@/lib/session'

export const runtime = 'nodejs'

// Orders not ready yet, per due date — the small numbers on the Need By calendar
export async function GET(req: NextRequest) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return NextResponse.json({ counts: await countOpenOrdersByDueDate() })
  } catch (err) {
    console.error('[orders] Failed to count orders by due date:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
