import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME, RENEW_AFTER, createToken, sessionCookie, sessionIssuedAt } from '@/lib/session'

// These routes are accessible without a session
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/printer/poll',   // Epson printer polls this — no browser session
  '/api/printer/queue',  // Print Ticket button posts here from client
  '/api/contact',        // Public contact form
  '/api/sms/incoming',   // Twilio posts customer texts here — checks the Twilio signature itself
]

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  // Allow public auth endpoints
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  // Verify session cookie
  const token = req.cookies.get(COOKIE_NAME)?.value
  const issuedAt = token ? await sessionIssuedAt(token) : null
  if (issuedAt === null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Keep devices signed in while they're used: renew the session (at most daily)
  const res = NextResponse.next()
  if (Date.now() / 1000 - issuedAt > RENEW_AFTER) {
    res.cookies.set(sessionCookie(await createToken()))
  }
  return res
}

export const config = {
  matcher: '/api/:path*',
}
