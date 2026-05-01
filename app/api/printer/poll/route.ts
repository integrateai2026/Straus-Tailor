import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildReceipt } from '@/lib/escpos'
import { Order } from '@/lib/types'

// The printer polls this endpoint every 5 seconds.
// If there's a pending job, we return ESC/POS bytes and mark it printed.
// If nothing to print, return 204 No Content.

export async function GET(req: NextRequest) {
  // Optional: verify printer token
  const token = req.nextUrl.searchParams.get('token')
  if (process.env.PRINTER_TOKEN && token !== process.env.PRINTER_TOKEN) {
    return new NextResponse(null, { status: 401 })
  }

  // Fetch oldest pending job
  const { data, error } = await supabase
    .from('print_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return new NextResponse(null, { status: 204 })
  }

  // Mark as printed immediately so it doesn't get picked up twice
  await supabase
    .from('print_queue')
    .update({ status: 'printed', printed_at: new Date().toISOString() })
    .eq('id', data.id)

  // Build ESC/POS receipt
  const order = data.order_data as Order
  const receipt = buildReceipt(order)

  return new NextResponse(receipt, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': receipt.length.toString(),
    },
  })
}

// Also support POST (some printer firmware uses POST)
export { GET as POST }
