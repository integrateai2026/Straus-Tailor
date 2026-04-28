import fs from 'fs'
import path from 'path'
import { Order, CreateOrderInput, UpdateOrderInput } from './types'

const DATA_FILE = path.join(process.cwd(), 'data', 'orders.json')

function readOrders(): Order[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
      fs.writeFileSync(DATA_FILE, JSON.stringify({ orders: [], nextNumber: 10001 }, null, 2))
      return []
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw).orders as Order[]
  } catch {
    return []
  }
}

function readStore(): { orders: Order[]; nextNumber: number } {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = { orders: [], nextNumber: 10001 }
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2))
      return initial
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { orders: [], nextNumber: 10001 }
  }
}

function writeStore(store: { orders: Order[]; nextNumber: number }) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2))
}

export function getAllOrders(): Order[] {
  return readOrders().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getOrderById(id: string): Order | undefined {
  return readOrders().find((o) => o.id === id)
}

export function createOrder(input: CreateOrderInput): Order {
  const store = readStore()
  const orderNumber = store.nextNumber
  const order: Order = {
    id: `#${orderNumber}`,
    orderNumber,
    customerName: input.customerName,
    phone: input.phone,
    dropoffDate: input.dropoffDate,
    dueDate: input.dueDate,
    notes: input.notes,
    status: 'active',
    paid: false,
    pickedUp: false,
    createdAt: new Date().toISOString(),
  }
  store.orders.push(order)
  store.nextNumber = orderNumber + 1
  writeStore(store)
  return order
}

export function updateOrder(id: string, input: UpdateOrderInput): Order | undefined {
  const store = readStore()
  const idx = store.orders.findIndex((o) => o.id === id)
  if (idx === -1) return undefined
  store.orders[idx] = { ...store.orders[idx], ...input }
  writeStore(store)
  return store.orders[idx]
}
