import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export const COOKIE_NAME = 'straus_session'

// The shop's devices should never have to sign in again: sessions last as long as
// browsers allow a cookie to live (400 days) and renew themselves daily while the
// app is in use (see proxy.ts), so in practice they don't expire.
export const MAX_AGE = 60 * 60 * 24 * 400 // 400 days in seconds — the browser maximum
export const RENEW_AFTER = 60 * 60 * 24   // re-issue at most once a day

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(s)
}

export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'staff' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
}

/** When a valid session was issued (seconds since epoch), or null if it isn't valid */
export async function sessionIssuedAt(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload.iat ?? 0
  } catch {
    return null
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  return (await sessionIssuedAt(token)) !== null
}

/** Cookie settings for a session token — used at login and when renewing */
export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: MAX_AGE,
    path: '/',
  }
}

/**
 * Call at the top of any staff-only API route.
 * Returns true if the request carries a valid session cookie.
 */
export async function requireAuth(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyToken(token)
}
