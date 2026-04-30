import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/session'

// These routes are accessible without a session
const PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/logout', '/api/auth/me']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  // Allow public auth endpoints
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  // Verify session cookie
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
