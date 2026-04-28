import { NextRequest, NextResponse } from 'next/server'
import { createToken, COOKIE_NAME, MAX_AGE } from '@/lib/session'

// In-memory rate limiter: 10 attempts per 15 minutes per IP
const attempts = new Map<string, { count: number; resetAt: number }>()

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 })
    return false
  }
  if (entry.count >= 10) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const username = String(body.username ?? '').trim()
    const password = String(body.password ?? '')

    const validUser = process.env.APP_USERNAME ?? ''
    const validPass = process.env.APP_PASSWORD ?? ''

    if (
      !username ||
      !password ||
      username.toLowerCase() !== validUser.toLowerCase() ||
      password !== validPass
    ) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Clear rate limit counter on successful login
    attempts.delete(ip)

    const token = await createToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: MAX_AGE,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
