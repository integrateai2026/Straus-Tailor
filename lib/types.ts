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
  notifiedAt?: string
  completedAt?: string
}

export interface CreateOrderInput {
  customerName: string
  phone: string
  dropoffDate: string
  dueDate: string
  notes: string
}

export interface UpdateOrderInput {
  status?: OrderStatus
  paid?: boolean
  pickedUp?: boolean
  notifiedAt?: string
  completedAt?: string
}
