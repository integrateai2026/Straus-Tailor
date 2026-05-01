import { Order } from './types'

// ESC/POS command constants
const ESC = 0x1b
const GS  = 0x1d
const LF  = 0x0a

const CMD = {
  INIT:        [ESC, 0x40],
  CENTER:      [ESC, 0x61, 0x01],
  LEFT:        [ESC, 0x61, 0x00],
  BOLD_ON:     [ESC, 0x45, 0x01],
  BOLD_OFF:    [ESC, 0x45, 0x00],
  DOUBLE_ON:   [GS,  0x21, 0x11],  // 2x width + 2x height
  DOUBLE_OFF:  [GS,  0x21, 0x00],
  FULL_CUT:    [GS,  0x56, 0x00],
  FEED_3:      [ESC, 0x64, 0x03],
}

function bytes(...args: (number[] | number | string)[]): number[] {
  const out: number[] = []
  for (const a of args) {
    if (typeof a === 'string') {
      for (const ch of a) out.push(ch.charCodeAt(0))
    } else if (typeof a === 'number') {
      out.push(a)
    } else {
      out.push(...a)
    }
  }
  return out
}

function line(text = ''): number[] {
  return bytes(text, LF)
}

function divider(char = '-', width = 42): number[] {
  return line(char.repeat(width))
}

function padRow(label: string, value: string, width = 42): string {
  const maxVal = width - label.length - 1
  const val = value.length > maxVal ? value.slice(0, maxVal) : value
  return label + ' '.repeat(width - label.length - val.length) + val
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
  return raw
}

export function buildReceipt(order: Order): Buffer {
  const cmds: number[] = []
  const push = (...args: (number[] | number | string)[]) => cmds.push(...bytes(...args))

  push(...CMD.INIT)

  // ── Header ──────────────────────────────────────────
  push(...CMD.CENTER)
  push(...CMD.DOUBLE_ON)
  push(...CMD.BOLD_ON)
  push(...line('Straus Tailor Shop'))
  push(...CMD.DOUBLE_OFF)
  push(...CMD.BOLD_OFF)
  push(...line('1326 25th St S Suite B'))
  push(...line('Fargo, ND 58103'))
  push(...line('(701) 929-8262'))
  push(...divider('='))

  // ── Order ID ─────────────────────────────────────────
  push(...CMD.CENTER)
  push(...line('ORDER ID'))
  push(...CMD.DOUBLE_ON)
  push(...CMD.BOLD_ON)
  push(...line(order.id))
  push(...CMD.DOUBLE_OFF)
  push(...CMD.BOLD_OFF)
  push(...CMD.BOLD_ON)
  push(...line(order.paid ? '*** PAID ***' : '--- UNPAID ---'))
  push(...CMD.BOLD_OFF)
  push(...divider('-'))

  // ── Details ──────────────────────────────────────────
  push(...CMD.LEFT)
  const rows: [string, string][] = [
    ['CUSTOMER:', order.customerName],
    ['PHONE:',    formatPhone(order.phone)],
    ['DROP-OFF:', formatDate(order.dropoffDate)],
    ['DUE DATE:', formatDate(order.dueDate)],
  ]
  if (order.totalAmount != null) rows.push(['TOTAL:',  `$${order.totalAmount.toFixed(2)}`])
  if (order.itemCount   != null) rows.push(['ITEMS:',  `${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}`])

  for (const [label, value] of rows) {
    push(...line(padRow(label, value)))
  }

  if (order.notes) {
    push(...divider('-'))
    push(...CMD.BOLD_ON)
    push(...line('NOTES:'))
    push(...CMD.BOLD_OFF)
    push(...line(order.notes))
  }

  // ── Footer ───────────────────────────────────────────
  push(...divider('='))
  push(...CMD.CENTER)
  push(...line('Thank you for your business!'))
  push(...CMD.FEED_3)
  push(...CMD.FULL_CUT)

  return Buffer.from(cmds)
}
