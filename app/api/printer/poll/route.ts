export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { buildReceipt } from '@/lib/escpos'
import { Order } from '@/lib/types'

async function handler(req: NextRequest) {
  // Fetch oldest pending job
  const { data } = await supabase
    .from('print_queue')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!data) {
    return new NextResponse(null, { status: 204 })
  }

  // Mark as printed immediately so it doesn't get picked up twice
  await supabase
    .from('print_queue')
    .update({ status: 'printed', printed_at: new Date().toISOString() })
    .eq('id', data.id)

  // Build ESC/POS receipt bytes
  const order = data.order_data as Order
  const receipt = buildReceipt(order)

  const body = new Uint8Array(receipt)
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(body.length),
    },
  })
}

export { handler as GET, handler as POST }
