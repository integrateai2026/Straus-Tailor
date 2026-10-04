export type OrderStatus = 'active' | 'notified' | 'completed'

// A dated pickup change, kept so the order's History shows what happened and when
export interface OrderEvent {
  event: 'picked_up' | 'pickup_undone'
  at: string // ISO time
}

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
  history?: OrderEvent[]
  tailors?: string[]   // who worked on it (optional)
}

// The staff dashboard's refresh: just what changed since its last one (GET /api/orders?since=)
export interface OrderChanges {
  full: boolean    // true: `orders` is every order (replace the list); false: only changed ones (merge)
  orders: Order[]
  cursor: string   // send back as `since` next time
  total: number    // how many orders exist, so the dashboard can tell it's out of step
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
  history?: OrderEvent[]
  tailors?: string[] | null
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
