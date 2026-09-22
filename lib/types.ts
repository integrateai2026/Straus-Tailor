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
  smsConsent?: boolean
  smsTransactional?: boolean
  smsMarketing?: boolean
  garments?: Record<string, number>
  alterations?: string[]
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
  smsConsent?: boolean
  smsTransactional?: boolean
  smsMarketing?: boolean
  garments?: Record<string, number>
  alterations?: string[]
}

export interface UpdateOrderInput {
  status?: OrderStatus
  paid?: boolean
  pickedUp?: boolean
  pickedUpAt?: string
  notifiedAt?: string[]
  completedAt?: string
  totalAmount?: number | null
  itemCount?: number
  customerName?: string
  phone?: string
  dropoffDate?: string
  dueDate?: string
  notes?: string
}

export type SmsDirection = 'inbound' | 'outbound'

// One text to or from a customer
export interface SmsMessage {
  id: string
  phone: string                      // customer's number, digits only
  orderId?: string                   // order the text is about, when known
  direction: SmsDirection
  body: string
  media: { contentType: string }[]   // photos etc., served by /api/messages/[id]/media/[index]
  createdAt: string
  readAt?: string
}

// A customer's conversation, as listed in the Messages panel
export interface SmsThread {
  phone: string
  orderId?: string
  customerName?: string
  unread: number
  lastBody: string
  lastDirection: SmsDirection
  lastAt: string
  lastHasMedia: boolean
}
