import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// ── Rate limiter (in-memory, per server instance) ─────────────────────────────
// Tracks: { ip → [timestamps of submissions] }
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_MAX      = 3    // max submissions
const RATE_LIMIT_WINDOW   = 60 * 60 * 1000  // per 1 hour (ms)

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimitMap.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW)
  if (hits.length >= RATE_LIMIT_MAX) return true
  rateLimitMap.set(ip, [...hits, now])
  return false
}

// ── POST /api/contact ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────
    const body = await req.json()
    const { name, email, message, website, loadedAt } = body

    // ── 2. Honeypot — bots fill the hidden "website" field, humans don't ──
    if (website) {
      // Silently accept so bots don't know they were caught
      return NextResponse.json({ ok: true })
    }

    // ── 3. Time-on-page check — reject if form submitted under 3 seconds ──
    const elapsed = Date.now() - (loadedAt ?? 0)
    if (elapsed < 3000) {
      return NextResponse.json({ ok: true }) // silent reject
    }

    // ── 4. Input validation ────────────────────────────────────────────────
    const safeName    = String(name    ?? '').trim().slice(0, 100)
    const safeEmail   = String(email   ?? '').trim().slice(0, 200)
    const safeMessage = String(message ?? '').trim().slice(0, 3000)

    if (!safeName || !safeEmail || !safeMessage) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // ── 5. Rate limiting ───────────────────────────────────────────────────
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please try again later.' },
        { status: 429 }
      )
    }

    // ── 6. Send email ──────────────────────────────────────────────────────
    // Create transport here (not at module level) so env vars are guaranteed loaded
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    if (!gmailUser || !gmailPass) {
      console.error('[contact] Missing GMAIL_USER or GMAIL_APP_PASSWORD env vars')
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,       // STARTTLS
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: `"Straus Tailor Shop Website" <${gmailUser}>`,
      to: gmailUser,
      replyTo: safeEmail,
      subject: `New message from ${safeName} — Straus Tailor Shop`,
      text: [
        `Name:    ${safeName}`,
        `Email:   ${safeEmail}`,
        ``,
        `Message:`,
        safeMessage,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#6B1A2C;margin:0 0 24px">New Website Message</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:10px 16px;background:#f7f3ec;font-weight:600;width:80px;border-radius:4px 0 0 4px">Name</td>
              <td style="padding:10px 16px;background:#f7f3ec;border-radius:0 4px 4px 0">${safeName}</td>
            </tr>
            <tr><td colspan="2" style="height:6px"/></tr>
            <tr>
              <td style="padding:10px 16px;background:#f7f3ec;font-weight:600;border-radius:4px 0 0 4px">Email</td>
              <td style="padding:10px 16px;background:#f7f3ec;border-radius:0 4px 4px 0">
                <a href="mailto:${safeEmail}" style="color:#6B1A2C">${safeEmail}</a>
              </td>
            </tr>
          </table>
          <div style="background:#f7f3ec;border-radius:4px;padding:16px">
            <div style="font-weight:600;margin-bottom:10px">Message</div>
            <div style="white-space:pre-wrap;line-height:1.6">${safeMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          <p style="color:#75758a;font-size:12px;margin-top:24px">
            Sent from the Straus Tailor Shop contact form · Reply to this email to respond directly to ${safeName}.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contact] email error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}

// Block all other methods
export async function GET()    { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function PUT()    { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
export async function DELETE() { return NextResponse.json({ error: 'Not found' }, { status: 404 }) }
