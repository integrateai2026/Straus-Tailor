import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder } from '@/lib/store'
import { requireAuth } from '@/lib/session'
import { pickupChange } from '@/lib/orderHistory'
import { normalizeTailors } from '@/lib/tailors'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const order = await getOrderById(decodeURIComponent(id))
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const body = await req.json()

  // Normalize notes server-side so edits get the same cap as new orders
  if (body.notes !== undefined) {
    body.notes = String(body.notes ?? '').trim().slice(0, 1000)
  }

  // History is kept by the server only
  delete body.history

  // Tailors who worked on it: optional; trimmed, no repeats, null when none picked
  if (body.tailors !== undefined) {
    body.tailors = normalizeTailors(body.tailors)
  }

  // Marking picked up (or undoing it) sets the status and adds a dated entry to the
  // order's history; undoing sends the order back to Active
  if (typeof body.pickedUp === 'boolean') {
    const current = await getOrderById(decodedId)
    if (current && body.pickedUp !== current.pickedUp) {
      Object.assign(body, pickupChange(current, body.pickedUp, new Date().toISOString()))
    }
  }

  const order = await updateOrder(decodedId, body)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
