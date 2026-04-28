import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder } from '@/lib/store'

export async function POST(req: NextRequest) {
  try {
    const { orderId, phone, message } = await req.json()

    if (!orderId || !phone || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const accountSid  = process.env.TWILIO_ACCOUNT_SID
    const authToken   = process.env.TWILIO_AUTH_TOKEN
    const fromNumber  = process.env.TWILIO_FROM_NUMBER

    if (accountSid && authToken && fromNumber) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, From: fromNumber, Body: message }),
      })
      if (!response.ok) {
        const err = await response.json()
        return NextResponse.json({ error: err.message || 'SMS failed' }, { status: 500 })
      }
    }

    // Append this send time to the notifiedAt history
    const current = getOrderById(orderId)
    const existing: string[] = Array.isArray(current?.notifiedAt)
      ? current.notifiedAt
      : current?.notifiedAt
        ? [current.notifiedAt as unknown as string]  // backwards compat with old string value
        : []

    const updated = updateOrder(orderId, {
      status: 'notified',
      notifiedAt: [...existing, new Date().toISOString()],
    })

    return NextResponse.json({ success: true, demo: !accountSid, order: updated })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
