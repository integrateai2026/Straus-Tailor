require('dotenv').config()
const net = require('net')
const { createClient } = require('@supabase/supabase-js')

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.SUPABASE_URL
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY
const PRINTER_IP        = process.env.PRINTER_IP
const PRINTER_PORT      = parseInt(process.env.PRINTER_PORT || '9100', 10)
const POLL_INTERVAL     = parseInt(process.env.POLL_INTERVAL || '2000', 10)

if (!SUPABASE_URL || !SUPABASE_KEY || !PRINTER_IP) {
  console.error('❌  Missing required .env values. Check SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PRINTER_IP.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── ESC/POS helpers ───────────────────────────────────────────────────────────
// 80mm paper = 42 chars wide at normal font
const ESC   = 0x1B
const GS    = 0x1D
const WIDTH = 42

const CMD = {
  init:    Buffer.from([ESC, 0x40]),
  cut:     Buffer.from([GS,  0x56, 0x42, 0x05]),
  center:  Buffer.from([ESC, 0x61, 0x01]),
  boldOn:  Buffer.from([ESC, 0x45, 0x01]),
  boldOff: Buffer.from([ESC, 0x45, 0x00]),
  tallOn:  Buffer.from([GS,  0x21, 0x01]),   // 2x height ONLY (no width change = no overflow)
  tallOff: Buffer.from([GS,  0x21, 0x00]),
  smallOn: Buffer.from([ESC, 0x4D, 0x01]),   // condensed font
  smallOff:Buffer.from([ESC, 0x4D, 0x00]),
  feed:    (n) => Buffer.from([ESC, 0x64, n]),
}

const t   = (str) => Buffer.from(str + '\n', 'utf8')
const div = (char = '-') => t(char.repeat(WIDTH))

// Field: small label then normal bold value
const field = (label, value) => [
  CMD.center, CMD.smallOn,  t(label.toUpperCase()), CMD.smallOff,
  CMD.center, CMD.boldOn,   t(String(value)),        CMD.boldOff,
  CMD.feed(1),
]

// Big field: small label + 2x-height bold value, no extra feed — same total length as field()
const bigField = (label, value) => [
  CMD.center, CMD.smallOn, t(label.toUpperCase()), CMD.smallOff,
  CMD.center, CMD.boldOn, CMD.tallOn, t(String(value)), CMD.tallOff, CMD.boldOff,
]

// Wrap long text into lines of max `maxLen` chars
function wrapText(text, maxLen = 38) {
  const words = text.split(', ')
  const lines = []
  let line = ''
  for (const word of words) {
    if (line && line.length + 2 + word.length > maxLen) {
      lines.push(line)
      line = word
    } else {
      line = line ? line + ', ' + word : word
    }
  }
  if (line) lines.push(line)
  return lines
}

// Field with optional multi-line value
const fieldLines = (label, lines) => {
  const parts = [
    CMD.center, CMD.smallOn, t(label.toUpperCase()), CMD.smallOff,
  ]
  for (const l of lines) {
    parts.push(CMD.center, CMD.boldOn, t(l), CMD.boldOff)
  }
  parts.push(CMD.feed(1))
  return parts
}

function buildReceipt(order) {
  const {
    orderNumber, customerName, phone,
    dropoffDate, dueDate,
    totalAmount, paid, smsConsent,
  } = order

  const fmt = (d) => {
    if (!d) return '--'
    const [y, m, day] = d.split('T')[0].split('-').map(Number)
    return new Date(y, m - 1, day).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  }

  const parts = [
    CMD.init,
    CMD.center,

    // ── Header ────────────────────────────────────────────────────────────
    CMD.boldOn, CMD.tallOn,
    t('Straus Tailor Shop'),
    CMD.tallOff, CMD.boldOff,
    CMD.smallOn,
    t('1326 25th St S  Fargo, ND 58103'),
    t('(701) 929-8262'),
    CMD.smallOff,

    div('='),

    // ── Order number ──────────────────────────────────────────────────────
    CMD.center, CMD.smallOn, t('ORDER ID'), CMD.smallOff,
    CMD.center, CMD.boldOn,  CMD.tallOn,
    t(`#${orderNumber}`),
    CMD.tallOff, CMD.boldOff,

    div('='),

    // ── Core fields ───────────────────────────────────────────────────────
    ...bigField('Customer', customerName),
  ]

  if (phone)  parts.push(...bigField('Phone',    phone))
  parts.push(  ...bigField('Drop-Off', fmt(dropoffDate)))
  parts.push(  ...bigField('Due Date', fmt(dueDate)))
  const totalStr = totalAmount
    ? `$${Number(totalAmount).toFixed(2)} (${paid ? 'Paid' : 'Unpaid'})`
    : (paid ? 'Paid' : 'Unpaid')
  parts.push(...bigField('Total', totalStr))
  parts.push(...field('SMS Consent', smsConsent ? 'Yes' : 'No'))

  // ── Footer ────────────────────────────────────────────────────────────
  parts.push(
    div('='),
    CMD.center, CMD.boldOn,
    t('Thank you for your business!'),
    CMD.boldOff,
    CMD.feed(3),
    CMD.cut,
  )

  return Buffer.concat(parts)
}

// ── Send receipt to printer via raw TCP ───────────────────────────────────────
function sendToPrinter(data) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket()
    socket.setTimeout(5000)

    socket.connect(PRINTER_PORT, PRINTER_IP, () => {
      socket.write(data, () => {
        socket.destroy()
        resolve()
      })
    })

    socket.on('timeout', () => { socket.destroy(); reject(new Error('Printer connection timed out')) })
    socket.on('error',   (err) => reject(err))
  })
}

// ── Poll Supabase for pending jobs ────────────────────────────────────────────
let processing = false

async function poll() {
  if (processing) return
  processing = true

  try {
    // Fetch all pending jobs oldest-first
    const { data: jobs, error } = await supabase
      .from('print_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)

    if (error) { console.error('Supabase fetch error:', error.message); return }
    if (!jobs || jobs.length === 0) return

    for (const job of jobs) {
      const order = job.order_data
      console.log(`🖨  Printing order #${order.orderNumber} — ${order.customerName}`)

      try {
        const receipt = buildReceipt(order)
        await sendToPrinter(receipt)

        await supabase
          .from('print_queue')
          .update({ status: 'done', printed_at: new Date().toISOString() })
          .eq('id', job.id)

        console.log(`✅  Done — order #${order.orderNumber}`)
      } catch (err) {
        console.error(`❌  Print failed for order #${order.orderNumber}:`, err.message)

        await supabase
          .from('print_queue')
          .update({ status: 'error', error_message: err.message })
          .eq('id', job.id)
      }
    }
  } finally {
    processing = false
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
console.log('='.repeat(48))
console.log('  Straus Tailor Shop — Print Agent')
console.log(`  Printer : ${PRINTER_IP}:${PRINTER_PORT}`)
console.log(`  Polling : every ${POLL_INTERVAL / 1000}s`)
console.log('='.repeat(48))

setInterval(poll, POLL_INTERVAL)
poll() // run immediately on start
