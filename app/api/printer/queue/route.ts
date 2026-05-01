export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Order } from '@/lib/types'

async function handler(req: NextRequest) {
  try {
    const body = await req.json()
    const order = body.order as Order

    if (!order?.id) {
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 })
    }

    const { error } = await supabase.from('print_queue').insert({
      order_id:   order.id,
      order_data: order,
      status:     'pending',
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('print_queue insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('queue route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export { handler as POST }
