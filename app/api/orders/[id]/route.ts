import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder } from '@/lib/store'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(decodeURIComponent(id))
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const body = await req.json()

  // Auto-record pickup timestamp on first mark as picked up
  if (body.pickedUp === true) {
    const current = await getOrderById(decodedId)
    if (!current?.pickedUpAt) {
      body.pickedUpAt = new Date().toISOString()
    }
  }

  const order = await updateOrder(decodedId, body)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
