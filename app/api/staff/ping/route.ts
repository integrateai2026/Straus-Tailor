import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Open endpoint — no auth. Used to confirm Next.js routing is reachable.
// Remove after debugging.
export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() })
}
