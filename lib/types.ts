export type OrderStatus = 'active' | 'notified' | 'completed'

export interface Order {
  id: string
  orderNumber: number
  customerName: string
  phone: string
  dropoffDate: string
  dueDate: string
  notes: string
  status: OrderStatus
  paid: boolean
  pickedUp: boolean
  createdAt: string
  notifiedAt?: string[]
  pickedUpAt?: string
  completedAt?: string
  totalAmount?: number
  itemCount?: number
}

export interface CreateOrderInput {
  customerName: string
  phone: string
  dropoffDate: string
  dueDate: string
  notes: string
  totalAmount?: number
  itemCount?: number
  paid?: boolean
}

export interface UpdateOrderInput {
  status?: OrderStatus
  paid?: boolean
  pickedUp?: boolean
  pickedUpAt?: string
  notifiedAt?: string[]
  completedAt?: string
  totalAmount?: number
  itemCount?: number
}
