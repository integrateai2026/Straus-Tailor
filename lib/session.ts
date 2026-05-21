import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export const COOKIE_NAME = 'straus_session'
export const MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET is not set')
  return new TextEncoder().encode(s)
}

export async function createToken(): Promise<string> {
  return new SignJWT({ role: 'staff' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret())
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
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
